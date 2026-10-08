import { Page, APIRequestContext } from '@playwright/test';

export const USERS = {
  teacher: {
    email: 'sneha.patil@ritindia.edu',
    password: 'password',
    name: 'Prof. Sneha Patil',
  },
  studentWithResults: {
    email: '2303026@ritindia.edu',
    password: 'password',
    name: 'Atharv Thorat',
  },
  studentAlternate: {
    email: '2303017@ritindia.edu',
    password: 'password',
    name: 'Priya Kulkarni',
  },
  studentJoining: {
    email: '2303055@ritindia.edu',
    password: 'password',
    name: 'Omkar Shinde',
  },
};

/**
 * Log in via frontend UI at /login
 */
export async function loginAs(page: Page, email: string, password: string = 'password') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]:has-text("Log in")');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function loginAsTeacher(page: Page) {
  await loginAs(page, USERS.teacher.email, USERS.teacher.password);
  await page.waitForURL('**/teacher', { timeout: 15000 });
}

export async function loginAsStudent(page: Page, email: string = USERS.studentWithResults.email) {
  await loginAs(page, email, 'password');
  await page.waitForURL('**/student', { timeout: 15000 });
}

/**
 * Obtain JWT token for teacher directly from backend API
 */
export async function getTeacherToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('http://localhost:8000/api/auth/login', {
    data: {
      email: USERS.teacher.email,
      password: USERS.teacher.password,
    },
  });
  if (!res.ok()) {
    throw new Error(`Teacher login failed (${res.status()}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

export interface CreatedTestClass {
  id: number;
  name: string;
  join_code: string;
  join_token: string;
  subject_name: string;
  subject_code: string;
  teacher_name?: string;
  student_count?: number;
}

/**
 * Create a temporary classroom via Teacher API and return its details including the 6-character join_code
 */
export async function createTestClass(request: APIRequestContext, teacherToken?: string): Promise<CreatedTestClass> {
  const token = teacherToken || (await getTeacherToken(request));
  const uniqueCode = `AT${Math.floor(1000 + Math.random() * 9000)}`;
  const res = await request.post('http://localhost:8000/api/classes', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      subject_name: `Test Class ${uniqueCode}`,
      subject_code: uniqueCode,
      department: 'CSE (AI & ML)',
      year: 'LY',
      division: 'A',
      semester: 7,
      academic_year: '2024-25',
      allow_join: true,
    },
  });
  if (!res.ok()) {
    throw new Error(`Create test classroom failed (${res.status()}): ${await res.text()}`);
  }
  const data = await res.json();
  return data;
}
