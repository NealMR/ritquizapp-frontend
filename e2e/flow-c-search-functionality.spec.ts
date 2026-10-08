import { test, expect } from '@playwright/test';
import { USERS, loginAs } from './helpers/auth';

test.describe('Flow C: Real-Time Search Functionality', () => {
  test('Test 1: Student Results search (/student/results) filters results dynamically and supports clear', async ({ page }) => {
    await loginAs(page, USERS.studentWithResults.email, USERS.studentWithResults.password);
    await page.goto('/student/results');
    await page.waitForURL('**/student/results');

    const table = page.locator('table');
    // Verify initial table contains CNN quiz
    await expect(table.locator('text=CNN basics – Unit 2').first()).toBeVisible();

    // Type in search query that matches
    const searchInput = page.locator('input[placeholder="Search quiz or class..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('CNN');

    // Matching item should remain visible and match counter appears
    await expect(table.locator('text=CNN basics – Unit 2').first()).toBeVisible();
    await expect(page.locator('text=matching').first()).toBeVisible();

    // Type a query that does NOT match anything
    await searchInput.fill('NonExistentQuizName123');
    await expect(table.locator('text=/No results match.*NonExistentQuizName123/')).toBeVisible();
    await expect(table.locator('text=CNN basics – Unit 2')).not.toBeVisible();

    // Click clear button
    const clearBtn = page.locator('button[aria-label="Clear search"]');
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
    await expect(table.locator('text=CNN basics – Unit 2').first()).toBeVisible();
  });

  test('Test 2: Student Dashboard (/student) search filters My Classes and Recent Results', async ({ page }) => {
    await loginAs(page, USERS.studentWithResults.email, USERS.studentWithResults.password);
    await page.waitForURL('**/student');

    // Test My classes search
    const classSearch = page.locator('input[placeholder="Search classes..."]');
    await expect(classSearch).toBeVisible();
    await classSearch.fill('Deep Learning');
    await expect(page.locator('text=Deep Learning – LY A').first()).toBeVisible();

    // Fill query that does not match any class
    await classSearch.fill('XYZ999');
    await expect(page.locator('text=/No classes match.*XYZ999/')).toBeVisible();
    const clearClassBtn = page.locator('button[aria-label="Clear class search"]');
    await clearClassBtn.click();
    await expect(page.locator('text=Deep Learning – LY A').first()).toBeVisible();

    // Test Recent results search
    const resultsSearch = page.locator('input[placeholder="Filter recent..."]');
    if (await resultsSearch.isVisible()) {
      await resultsSearch.fill('CNN');
      await expect(page.locator('text=CNN basics – Unit 2').first()).toBeVisible();
      await resultsSearch.fill('UnknownQuiz999');
      await expect(page.locator('text=/No recent results match.*UnknownQuiz999/')).toBeVisible();
      const clearResultsBtn = page.locator('button[aria-label="Clear results search"]');
      await clearResultsBtn.click();
      await expect(page.locator('text=CNN basics – Unit 2').first()).toBeVisible();
    }
  });

  test('Test 3: Teacher Dashboard (/teacher) search filters classes by name or subject code', async ({ page }) => {
    await loginAs(page, USERS.teacher.email, USERS.teacher.password);
    await page.waitForURL('**/teacher');

    const teacherSearch = page.locator('input[placeholder="Search classes by name, code, dept..."]');
    await expect(teacherSearch).toBeVisible();

    // Type a search query for existing class
    await teacherSearch.fill('AI401');
    await expect(page.locator('text=AI401').first()).toBeVisible();

    // Type non-existent class
    await teacherSearch.fill('NONEXISTENT_CODE_888');
    await expect(page.locator('text=/No classes match.*NONEXISTENT_CODE_888/')).toBeVisible();

    // Clear search
    const clearBtn = page.locator('button[aria-label="Clear search"]');
    await clearBtn.click();
    await expect(teacherSearch).toHaveValue('');
    await expect(page.locator('text=AI401').first()).toBeVisible();
  });
});
