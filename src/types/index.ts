
// Update the TestResult interface to include site information
export interface TestResult {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  time: string;
  result: "positive" | "negative";
  alcoholLevel?: number;
  notes?: string;
  siteId?: string;
  siteName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Update the Employee interface to include site information
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  registerNumber: string;
  status: "active" | "inactive";
  siteId?: string;
  siteName?: string;
  createdAt: Date;
}

// Update the DrawResult interface to include site information
export interface DrawResult {
  id: string;
  date: Date;
  employees: Employee[];
  notes?: string;
  siteId?: string;
  siteName?: string;
  createdAt: Date;
}

// Add interface for construction sites
export interface Site {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
}
