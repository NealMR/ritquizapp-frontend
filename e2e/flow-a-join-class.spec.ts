import { test, expect } from '@playwright/test';
import { USERS, loginAs, getTeacherToken, createTestClass } from './helpers/auth';

test.describe('Flow A: Student Join Class with Code', () => {
  let teacherToken: string;

  test.beforeAll(async ({ request }) => {
    teacherToken = await getTeacherToken(request);
  });

  test('Test 1: Student joins class with valid code on /student -> enters 6-character code -> clicks "Join class" -> verifies button loading state ("Joining...") -> verifies success message -> verifies newly joined class card appears in "My classes" list without requiring page reload', async ({ page, request }) => {
    // 1. Create a fresh test class dynamically via Teacher API
    const newClass = await createTestClass(request, teacherToken);
    expect(newClass.join_code).toHaveLength(6);

    // 2. Log in as Student
    await loginAs(page, USERS.studentJoining.email, USERS.studentJoining.password);
    await page.waitForURL('**/student');

    // 3. Open join modal and locate code input
    const openBtn = page.locator('button:has-text("Join class"), button:has-text("Join with code")').first();
    await openBtn.click();
    const codeInput = page.locator('#code');
    await expect(codeInput).toBeVisible();
    await codeInput.fill(newClass.join_code);

    const joinBtn = page.locator('button[type="submit"]:has-text("Join class")');
    await expect(joinBtn).toBeEnabled();

    // 4. Intercept the join API route with a short delay to verify button loading state ("Joining...")
    await page.route('**/api/classes/*/join', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });

    // 5. Click "Join class" and verify loading state
    await joinBtn.click();
    await expect(page.locator('button[type="submit"]')).toHaveText('Joining...');

    // 6. Verify success message banner appears
    const successBanner = page.locator('p.text-emerald-700');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText(/Successfully joined|Enrolled successfully|Successfully enrolled/i);

    // 7. Verify newly joined class card appears in "My classes" list WITHOUT requiring page reload
    const myClassesSection = page.locator('section', { has: page.locator('h2:has-text("My classes")') });
    await expect(myClassesSection.locator(`text=${newClass.name}`)).toBeVisible();
  });

  test('Test 2: Student inputs invalid/non-existent code -> clicks "Join class" -> verifies error banner is displayed', async ({ page }) => {
    // 1. Log in as Student
    await loginAs(page, USERS.studentJoining.email, USERS.studentJoining.password);
    await page.waitForURL('**/student');

    // 2. Open join modal and fill with non-existent 6-character code
    const openBtn = page.locator('button:has-text("Join class"), button:has-text("Join with code")').first();
    await openBtn.click();
    const codeInput = page.locator('#code');
    await expect(codeInput).toBeVisible();
    await codeInput.fill('ZZZZZZ');

    const joinBtn = page.locator('button[type="submit"]:has-text("Join class")');
    await expect(joinBtn).toBeEnabled();

    // 3. Submit form and verify error banner is displayed
    await joinBtn.click();
    const errorBanner = page.locator('p.text-ansA');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/Invalid join code|not found/i);
  });

  test('Test 3: Direct link / QR landing at /join/[token] -> student can see class info and click "Enroll in this class" to join', async ({ page, request }) => {
    // 1. Create a fresh test class dynamically
    const directClass = await createTestClass(request, teacherToken);

    // 2. Log in as Student
    await loginAs(page, USERS.studentAlternate.email, USERS.studentAlternate.password);
    await page.waitForURL('**/student');

    // 3. Navigate directly to /join/[token]
    await page.goto(`/join/${directClass.join_code}`);
    await page.waitForURL(`**/join/${directClass.join_code}`);

    // 4. Verify class information is visible
    await expect(page.locator(`h1:has-text("${directClass.name}")`)).toBeVisible();
    await expect(page.getByText(directClass.subject_code, { exact: true })).toBeVisible();
    await expect(page.locator('text=Prof. Sneha Patil')).toBeVisible();

    // 5. Verify and click "Enroll in this class" button
    const enrollBtn = page.locator('button:has-text("Enroll in this class")');
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // 6. Verify enrollment confirmation state
    await expect(page.locator(`text=You're in ${directClass.name}`)).toBeVisible();
    await expect(page.locator('text=Quizzes for this class will appear on your home screen.')).toBeVisible();

    // 7. Click "Go to dashboard" and verify newly joined class is in "My classes"
    const dashboardBtn = page.locator('button:has-text("Go to dashboard")');
    await dashboardBtn.click();
    await page.waitForURL('**/student');

    const myClassesSection = page.locator('section', { has: page.locator('h2:has-text("My classes")') });
    await expect(myClassesSection.locator(`text=${directClass.name}`)).toBeVisible();
  });

  test('Test 4 (Validation): Input validation disables "Join class" button when code is less than 6 characters', async ({ page }) => {
    await loginAs(page, USERS.studentJoining.email, USERS.studentJoining.password);
    await page.waitForURL('**/student');

    const openBtn = page.locator('button:has-text("Join class"), button:has-text("Join with code")').first();
    await openBtn.click();
    const codeInput = page.locator('#code');
    await codeInput.fill('ABC');

    const joinBtn = page.locator('button[type="submit"]:has-text("Join class")');
    await expect(joinBtn).toBeDisabled();
  });
});
