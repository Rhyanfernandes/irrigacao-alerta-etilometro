
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  active: boolean;
  createdAt: Date;
}

export interface TestResult {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  time: string;
  result: "positive" | "negative";
  notes?: string;
  alcoholLevel?: number; // New field for blood alcohol level
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawResult {
  id: string;
  date: Date;
  employeeIds: string[];
  employeeNames: string[];
  createdAt: Date;
}

export type SortDirection = "asc" | "desc";
