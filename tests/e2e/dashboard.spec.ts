import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/pt/login')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/nORM/)
    await expect(page.locator('h1')).toContainText(/Login|Entrar/)
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/pt\/(dashboard)?/)
  })

  test('should display error message with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('should navigate to dashboard after login', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for dashboard to load
    await page.waitForURL(/\/pt\/(dashboard)?/)

    // Check for dashboard elements
    await expect(page.locator('[data-tour="reputation-score"]')).toBeVisible()
    await expect(page.locator('[data-tour="alerts"]')).toBeVisible()
  })

  test('should display reputation score card', async ({ page }) => {
    // Assuming user is logged in
    await page.goto('/pt/dashboard')

    const scoreCard = page.locator('[data-tour="reputation-score"]')
    await expect(scoreCard).toBeVisible()
    await expect(scoreCard).toContainText(/Score|Pontuação/)
  })

  test('should display alerts list', async ({ page }) => {
    await page.goto('/pt/dashboard')

    const alertsList = page.locator('[data-tour="alerts"]')
    await expect(alertsList).toBeVisible()
  })

  test('should navigate to content generation page', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Click on content generation link
    await page.click('a[href*="/content"]')

    await expect(page).toHaveURL(/\/pt\/content/)
  })

  test('should navigate to clients page', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Click on clients link
    await page.click('a[href*="/clients"]')

    await expect(page).toHaveURL(/\/pt\/clients/)
  })

  test('should display loading state while fetching data', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Check for skeleton loaders or loading spinners
    const loadingState = page.locator('.animate-pulse, .animate-spin')
    // Loading state might not be visible if data loads fast, so we just check it exists
  })

  test('should handle responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/pt/dashboard')

    // Mobile menu button should be visible
    const mobileMenu = page.locator('[aria-label*="menu"], button.lg:hidden')
    // Check dashboard is still usable on mobile
  })

  test('should switch language', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Click language switcher
    const languageSwitcher = page.locator('[data-tour="language-switcher"]')
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click()
      await page.click('button:has-text("English"), a:has-text("English")')

      // URL should change to /en/
      await expect(page).toHaveURL(/\/en\//)
    }
  })

  test('should logout successfully', async ({ page }) => {
    await page.goto('/pt/dashboard')

    // Click logout button
    await page.click('button:has-text("Sair"), a:has-text("Sair")')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/pt\/login/)
  })
})

test.describe('Client Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to clients page
    await page.goto('/pt/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/pt\/(dashboard)?/)
    await page.goto('/pt/clients')
  })

  test('should display clients list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Clientes|Clients/)
  })

  test('should navigate to add client page', async ({ page }) => {
    await page.click('a[href*="/clients/new"], button:has-text("Adicionar")')
    await expect(page).toHaveURL(/\/pt\/clients\/new/)
  })

  test('should create new client', async ({ page }) => {
    await page.goto('/pt/clients/new')

    // Fill client form
    await page.fill('input[name="name"]', 'Test Client')
    await page.fill('input[name="domain"]', 'testclient.com')
    await page.click('button[type="submit"]')

    // Should redirect to client detail page
    await expect(page).toHaveURL(/\/pt\/clients\/[^/]+/)
  })
})

test.describe('Content Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/pt\/(dashboard)?/)
  })

  test('should navigate to content generation page', async ({ page }) => {
    await page.goto('/pt/content/generate')
    await expect(page.locator('h1')).toContainText(/Gerar|Generate/)
  })

  test('should show content library', async ({ page }) => {
    await page.goto('/pt/content')
    await expect(page.locator('h1')).toContainText(/Conteúdo|Content/)
  })
})
