/**
 * Cost Tracking & Budget Alerts
 *
 * Tracks API usage costs across all services (OpenAI, SerpAPI, etc.)
 * and sends alerts when approaching budget limits
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

// API cost per request (in USD)
const API_COSTS = {
  // OpenAI GPT-4
  openai_gpt4_input: 0.03 / 1000, // per 1K tokens
  openai_gpt4_output: 0.06 / 1000, // per 1K tokens
  openai_gpt35_input: 0.0015 / 1000,
  openai_gpt35_output: 0.002 / 1000,

  // SerpAPI
  serpapi_search: 0.005, // $50/month for 10k searches

  // Social Media (free but track rate limits)
  instagram_api: 0,
  linkedin_api: 0,
  facebook_api: 0,

  // Email
  resend_email: 0.001, // First 3k free, then $1/1k

  // News scraping (estimated)
  news_scrape: 0.001,
} as const

export type CostCategory = keyof typeof API_COSTS

export interface CostEntry {
  id?: string
  category: CostCategory
  amount: number
  quantity: number // tokens, requests, etc
  metadata?: Record<string, any>
  created_at?: string
}

export interface BudgetAlert {
  threshold: number // percentage (e.g., 80 = 80%)
  current_spend: number
  budget_limit: number
  period: 'daily' | 'monthly'
}

/**
 * Track API usage cost
 */
export async function trackCost(entry: CostEntry): Promise<void> {
  try {
    const supabase = await createClient()

    // Calculate cost
    const unitCost = API_COSTS[entry.category]
    const totalCost = unitCost * entry.quantity

    // Store in database
    await supabase.from('api_costs').insert({
      category: entry.category,
      amount: totalCost,
      quantity: entry.quantity,
      metadata: entry.metadata || {},
      created_at: new Date().toISOString(),
    })

    logger.info('Cost tracked', {
      category: entry.category,
      cost: totalCost,
      quantity: entry.quantity,
    })

    // Check if we need to send alerts
    await checkBudgetAlerts()
  } catch (error) {
    logger.error('Failed to track cost', { error, entry })
  }
}

/**
 * Get total costs for a period
 */
export async function getTotalCosts(
  period: 'today' | 'this_month' | 'last_30_days' = 'this_month'
): Promise<{ total: number; by_category: Record<CostCategory, number> }> {
  try {
    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    // Query costs
    const { data: costs, error } = await supabase
      .from('api_costs')
      .select('category, amount')
      .gte('created_at', startDate.toISOString())

    if (error) throw error

    // Aggregate by category
    const by_category: Record<string, number> = {}
    let total = 0

    costs?.forEach((cost) => {
      by_category[cost.category] = (by_category[cost.category] || 0) + cost.amount
      total += cost.amount
    })

    return {
      total,
      by_category: by_category as Record<CostCategory, number>,
    }
  } catch (error) {
    logger.error('Failed to get total costs', { error, period })
    return { total: 0, by_category: {} as Record<CostCategory, number> }
  }
}

/**
 * Check budget alerts and send notifications if needed
 */
export async function checkBudgetAlerts(): Promise<void> {
  try {
    // Get monthly budget from env (default $500)
    const monthlyBudget = parseInt(process.env.MONTHLY_API_BUDGET || '500', 10)
    const dailyBudget = monthlyBudget / 30

    // Get current spend
    const monthlyCosts = await getTotalCosts('this_month')
    const dailyCosts = await getTotalCosts('today')

    // Alert thresholds: 50%, 80%, 95%, 100%
    const thresholds = [50, 80, 95, 100]

    for (const threshold of thresholds) {
      // Check monthly budget
      const monthlyPercentage = (monthlyCosts.total / monthlyBudget) * 100
      if (monthlyPercentage >= threshold && monthlyPercentage < threshold + 5) {
        await sendBudgetAlert({
          threshold,
          current_spend: monthlyCosts.total,
          budget_limit: monthlyBudget,
          period: 'monthly',
        })
      }

      // Check daily budget
      const dailyPercentage = (dailyCosts.total / dailyBudget) * 100
      if (dailyPercentage >= threshold && dailyPercentage < threshold + 5) {
        await sendBudgetAlert({
          threshold,
          current_spend: dailyCosts.total,
          budget_limit: dailyBudget,
          period: 'daily',
        })
      }
    }
  } catch (error) {
    logger.error('Failed to check budget alerts', { error })
  }
}

/**
 * Send budget alert notification
 */
async function sendBudgetAlert(alert: BudgetAlert): Promise<void> {
  try {
    const supabase = await createClient()

    // Create alert in database
    await supabase.from('alerts').insert({
      type: 'budget_exceeded',
      severity: alert.threshold >= 95 ? 'critical' : alert.threshold >= 80 ? 'high' : 'medium',
      title: `Budget Alert: ${alert.threshold}% of ${alert.period} budget used`,
      description: `You've used $${alert.current_spend.toFixed(2)} of your $${alert.budget_limit.toFixed(2)} ${alert.period} budget (${alert.threshold}%)`,
      metadata: {
        threshold: alert.threshold,
        current_spend: alert.current_spend,
        budget_limit: alert.budget_limit,
        period: alert.period,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    logger.warn('Budget alert created', alert)

    // TODO: Send email notification
    // This will be handled by the alert notification system
  } catch (error) {
    logger.error('Failed to send budget alert', { error, alert })
  }
}

/**
 * Get cost projection for end of month
 */
export async function getCostProjection(): Promise<{
  current: number
  projected: number
  budget: number
  days_remaining: number
}> {
  try {
    const costs = await getTotalCosts('this_month')
    const monthlyBudget = parseInt(process.env.MONTHLY_API_BUDGET || '500', 10)

    // Calculate days in month and days elapsed
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysElapsed = now.getDate()
    const daysRemaining = daysInMonth - daysElapsed

    // Project spending based on current rate
    const dailyAverage = costs.total / daysElapsed
    const projected = costs.total + (dailyAverage * daysRemaining)

    return {
      current: costs.total,
      projected,
      budget: monthlyBudget,
      days_remaining: daysRemaining,
    }
  } catch (error) {
    logger.error('Failed to get cost projection', { error })
    return {
      current: 0,
      projected: 0,
      budget: 0,
      days_remaining: 0,
    }
  }
}

/**
 * Helper function to track OpenAI usage
 */
export async function trackOpenAICost(
  model: 'gpt-4' | 'gpt-3.5-turbo',
  inputTokens: number,
  outputTokens: number,
  metadata?: Record<string, any>
): Promise<void> {
  const category = model === 'gpt-4' ? 'openai_gpt4_input' : 'openai_gpt35_input'
  const outputCategory = model === 'gpt-4' ? 'openai_gpt4_output' : 'openai_gpt35_output'

  await trackCost({
    category,
    quantity: inputTokens,
    amount: 0, // Will be calculated
    metadata: { ...metadata, model, type: 'input' },
  })

  await trackCost({
    category: outputCategory,
    quantity: outputTokens,
    amount: 0,
    metadata: { ...metadata, model, type: 'output' },
  })
}

/**
 * Helper function to track SerpAPI usage
 */
export async function trackSerpAPICost(
  keywords: number,
  metadata?: Record<string, any>
): Promise<void> {
  await trackCost({
    category: 'serpapi_search',
    quantity: keywords,
    amount: 0,
    metadata,
  })
}
