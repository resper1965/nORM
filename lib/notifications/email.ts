/**
 * Email Notification Service
 * Send emails using Resend API
 */

import { Resend } from 'resend';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { ExternalAPIError } from '@/lib/errors/errors';

if (!env.RESEND_API_KEY) {
  logger.warn('Resend API key not configured');
}

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!resend) {
    throw new ExternalAPIError('Resend', 'API key not configured');
  }

  try {
    const result = await resend.emails.send({
      from: options.from || 'n.ORM <noreply@norm.app>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      emailId: result.data?.id,
    });
  } catch (error) {
    logger.error('Failed to send email', error as Error);
    throw new ExternalAPIError('Resend', 'Failed to send email', error as Error);
  }
}

/**
 * Send alert email
 */
export async function sendAlertEmail(
  to: string,
  alert: {
    title: string;
    message: string;
    severity: string;
    clientName: string;
    dashboardUrl: string;
  }
): Promise<void> {
  const severityEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '📢',
    low: 'ℹ️',
  }[alert.severity] || '📢';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0B0C0E; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #00ADE8; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${severityEmoji} ${alert.title}</h1>
          </div>
          <div class="content">
            <p><strong>Cliente:</strong> ${alert.clientName}</p>
            <p><strong>Severidade:</strong> ${alert.severity}</p>
            <p>${alert.message}</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${alert.dashboardUrl}" class="button">Ver Dashboard</a>
              <a href="${alert.dashboardUrl}/alerts" class="button">Ver Alertas</a>
            </div>
          </div>
          <div class="footer">
            <p>n<span style="color:#00ADE8">.</span>ORM - Online Reputation Manager</p>
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: `${severityEmoji} ${alert.title} - ${alert.clientName}`,
    html,
  });
}

/**
 * Get email recipients for alerts (admins and editors of a client)
 */
export async function getAlertRecipients(
  clientId: string,
  supabase: any
): Promise<string[]> {
  try {
    // Get client users with admin or editor role
    const { data: clientUsers, error } = await supabase
      .from('client_users')
      .select('user_id, role')
      .eq('client_id', clientId)
      .in('role', ['admin', 'editor']);

    if (error) {
      logger.error('Error fetching alert recipients', error);
      return [];
    }

    if (!clientUsers || clientUsers.length === 0) {
      return [];
    }

    // Get user emails from auth.users
    const userIds = clientUsers.map((cu: any) => cu.user_id);
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('id', userIds);

    if (usersError) {
      // Fallback: try to get emails via auth admin API or direct query
      logger.warn('Could not fetch user emails directly, trying alternative method');
      
      // Alternative: use Supabase admin client or RPC function
      // For now, return empty array if we can't get emails
      return [];
    }

    return (users || [])
      .map((u: any) => u.email)
      .filter((email: string | null): email is string => !!email && email.includes('@'));
  } catch (error) {
    logger.error('Error getting alert recipients', error as Error);
    return [];
  }
}
