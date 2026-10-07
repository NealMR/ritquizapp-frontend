// Static lists used by forms. Everything else comes from the API.
export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "CSE (AI & ML)",
  "Information Technology",
  "Electronics & Telecommunication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];
export const YEARS = [
  { value: "FY", label: "First Year" },
  { value: "SY", label: "Second Year" },
  { value: "TY", label: "Third Year" },
  { value: "LY", label: "Final Year" },
];
export const DESIGNATIONS = ["Assistant Professor", "Associate Professor", "Professor", "Head of Department", "Lab Instructor", "Visiting Faculty"];
export const COLLEGE_DOMAIN = "@ritindia.edu";

export const yearLabel = (y?: string) => YEARS.find((x) => x.value === y)?.label ?? "";
