
import { Employee, TestResult, DrawResult } from "@/types";

// Keys for localStorage
const STORAGE_KEYS = {
  EMPLOYEES: "irricom_employees",
  TESTS: "irricom_tests",
  DRAWS: "irricom_draws",
  APP_SETTINGS: "irricom_settings",
};

// Helper to trigger storage event for real-time updates
const triggerStorageEvent = (key: string) => {
  window.dispatchEvent(new Event('storage'));
};

// Employee functions
export const getEmployees = (): Employee[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings to Date objects
    return parsed.map((employee: any) => ({
      ...employee,
      createdAt: new Date(employee.createdAt),
    }));
  } catch (error) {
    console.error("Error parsing employees from localStorage:", error);
    return [];
  }
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  triggerStorageEvent(STORAGE_KEYS.EMPLOYEES);
};

export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  
  saveEmployees(employees);
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  const filtered = employees.filter(employee => employee.id !== id);
  saveEmployees(filtered);
};

// Test functions
export const getTests = (): TestResult[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TESTS);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings to Date objects
    return parsed.map((test: any) => ({
      ...test,
      date: new Date(test.date),
      createdAt: new Date(test.createdAt),
      updatedAt: new Date(test.updatedAt),
    }));
  } catch (error) {
    console.error("Error parsing tests from localStorage:", error);
    return [];
  }
};

export const saveTests = (tests: TestResult[]): void => {
  localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
  triggerStorageEvent(STORAGE_KEYS.TESTS);
};

export const saveTest = (test: TestResult): void => {
  const tests = getTests();
  const index = tests.findIndex(t => t.id === test.id);
  
  if (index >= 0) {
    tests[index] = test;
  } else {
    tests.push(test);
  }
  
  saveTests(tests);
};

export const deleteTest = (id: string): void => {
  const tests = getTests();
  const filtered = tests.filter(test => test.id !== id);
  saveTests(filtered);
};

// Draw functions
export const getDraws = (): DrawResult[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DRAWS);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings to Date objects
    return parsed.map((draw: any) => ({
      ...draw,
      date: new Date(draw.date),
      createdAt: new Date(draw.createdAt),
    }));
  } catch (error) {
    console.error("Error parsing draws from localStorage:", error);
    return [];
  }
};

export const saveDraws = (draws: DrawResult[]): void => {
  localStorage.setItem(STORAGE_KEYS.DRAWS, JSON.stringify(draws));
  triggerStorageEvent(STORAGE_KEYS.DRAWS);
};

export const saveDraw = (draw: DrawResult): void => {
  const draws = getDraws();
  const index = draws.findIndex(d => d.id === draw.id);
  
  if (index >= 0) {
    draws[index] = draw;
  } else {
    draws.push(draw);
  }
  
  saveDraws(draws);
};

export const deleteDraw = (id: string): void => {
  const draws = getDraws();
  const filtered = draws.filter(draw => draw.id !== id);
  saveDraws(filtered);
};

// App settings
export interface AppSettings {
  theme?: 'light' | 'dark';
  lastLogin?: Date;
  userPreferences?: {
    defaultDrawCount: number;
  };
}

export const getAppSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
  if (!stored) return { userPreferences: { defaultDrawCount: 3 } };
  
  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined,
    };
  } catch (error) {
    console.error("Error parsing app settings from localStorage:", error);
    return { userPreferences: { defaultDrawCount: 3 } };
  }
};

export const saveAppSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  triggerStorageEvent(STORAGE_KEYS.APP_SETTINGS);
};

// Data export
export const exportToCSV = (data: any[], fileName: string): void => {
  // Convert the data to a CSV string
  const replacer = (_key: string, value: any) => value === null ? '' : value;
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => 
      JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
