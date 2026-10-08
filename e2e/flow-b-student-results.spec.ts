import { test, expect } from '@playwright/test';
import { USERS, loginAs } from './helpers/auth';

test.describe('Flow B: Student Results Overview', () => {
  test('Test 1: Student logs in and lands on /student -> verifies "Recent results" panel renders real backend quiz data (e.g., "CNN basics – Unit 2")', async ({ page }) => {
    // 1. Log in as student with completed quiz results (Atharv Thorat)
    await loginAs(page, USERS.studentWithResults.email, USERS.studentWithResults.password);
    await page.waitForURL('**/student');

    // 2. Verify "Recent results" panel exists and is visible
    const resultsPanel = page.locator('section', { has: page.locator('h2:has-text("Recent results")') });
    await expect(resultsPanel).toBeVisible();

    // 3. Verify empty state message is NOT shown
    await expect(page.locator('text=Your quiz results will show up here.')).not.toBeVisible();

    // 4. Verify quiz data populated from backend database
    const quizTitle = page.locator('text=CNN basics – Unit 2').first();
    await expect(quizTitle).toBeVisible();

    const className = page.locator('text=Deep Learning – LY A').first();
    await expect(className).toBeVisible();

    const rankBadge = page.locator('text=#1').first();
    await expect(rankBadge).toBeVisible();

    const correctRatio = page.locator('text=3/3 correct').first();
    await expect(correctRatio).toBeVisible();
  });

  test('Test 2: Student navigates to /student/results -> verifies the 4 Overview KPI cards render real computed numbers (Quizzes Completed >= 1, Average Accuracy percentage, Total Points > 0, Best Rank)', async ({ page }) => {
    // 1. Log in as student with completed quiz results
    await loginAs(page, USERS.studentWithResults.email, USERS.studentWithResults.password);
    await page.waitForURL('**/student');

    // 2. Click "See all →" in the Recent results panel to navigate to /student/results
    const seeAllLink = page.locator('text=See all →');
    await expect(seeAllLink).toBeVisible();
    await seeAllLink.click();

    // 3. Verify URL is /student/results and page header is visible
    await page.waitForURL('**/student/results');
    await expect(page.locator('h1:has-text("My results")')).toBeVisible();
    await expect(page.locator('text=Every quiz you\'ve played.')).toBeVisible();

    // 4. Verify the 4 Overview KPI cards render real computed values:
    // Card 1: Quizzes Completed (>= 1)
    const quizzesCompletedCard = page.locator('p', { hasText: 'Quizzes Completed' }).locator('..');
    await expect(quizzesCompletedCard).toBeVisible();
    const countValue = await quizzesCompletedCard.locator('p.font-display').innerText();
    const parsedCount = parseInt(countValue, 10);
    expect(parsedCount).toBeGreaterThanOrEqual(1);

    // Card 2: Average Accuracy (percentage string like "100%")
    const accuracyCard = page.locator('p', { hasText: 'Average Accuracy' }).locator('..');
    await expect(accuracyCard).toBeVisible();
    const accuracyValue = await accuracyCard.locator('p.font-display').innerText();
    expect(accuracyValue).toMatch(/^\d+%/);

    // Card 3: Total Points (> 0)
    const pointsCard = page.locator('p', { hasText: 'Total Points' }).locator('..');
    await expect(pointsCard).toBeVisible();
    const pointsValue = await pointsCard.locator('p.font-display').innerText();
    const parsedPoints = parseInt(pointsValue.replace(/,/g, ''), 10);
    expect(parsedPoints).toBeGreaterThan(0);

    // Card 4: Best Rank (format "#1")
    const rankCard = page.locator('p', { hasText: 'Best Rank' }).locator('..');
    await expect(rankCard).toBeVisible();
    const rankValue = await rankCard.locator('p.font-display').innerText();
    expect(rankValue).toMatch(/^#\d+/);
  });

  test('Test 3: Verifies the detailed results table/list renders quiz title, class name, date, correct ratio, score, and rank populated from backend database', async ({ page }) => {
    // 1. Log in and navigate directly to /student/results
    await loginAs(page, USERS.studentWithResults.email, USERS.studentWithResults.password);
    await page.goto('/student/results');
    await page.waitForURL('**/student/results');

    // 2. Verify results table structure and headers
    const table = page.locator('table');
    await expect(table).toBeVisible();

    const headers = table.locator('thead th');
    await expect(headers.nth(0)).toHaveText('Quiz');
    await expect(headers.nth(1)).toHaveText('Date');
    await expect(headers.nth(2)).toHaveText('Correct');
    await expect(headers.nth(3)).toHaveText('Score');
    await expect(headers.nth(4)).toHaveText('Rank');

    // 3. Verify table rows populated with backend quiz results
    const rows = table.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);

    // Check specific quiz entries from seed data
    await expect(table.locator('text=CNN basics – Unit 2').first()).toBeVisible();
    await expect(table.locator('text=Deep Learning – LY A').first()).toBeVisible();
    await expect(table.locator('text=3/3').first()).toBeVisible();
    await expect(table.locator('text=2,932').first()).toBeVisible();
    await expect(table.locator('text=#1 of 2').first()).toBeVisible();

    // 4. Verify empty table banner is NOT present
    await expect(page.locator('text=No results yet. Join a live quiz to see your scores here.')).not.toBeVisible();
  });
});
