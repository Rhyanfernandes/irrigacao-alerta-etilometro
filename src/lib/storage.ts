
import { Employee, TestResult, DrawResult, Site } from "@/types";
import { getCurrentUser } from "./auth";
import {
  getEmployeesFromSupabase,
  saveEmployeeToSupabase,
  deleteEmployeeFromSupabase,
  getTestsFromSupabase,
  saveTestToSupabase,
  deleteTestFromSupabase,
  getDrawsFromSupabase,
  saveDrawToSupabase,
  deleteDrawFromSupabase,
  getSitesFromSupabase,
  saveSiteToSupabase,
  deleteSiteFromSupabase,
} from './supabase-storage';

// Keys for localStorage
const STORAGE_KEYS = {
  EMPLOYEES: "irricom_employees",
  TESTS: "irricom_tests",
  DRAWS: "irricom_draws",
  APP_SETTINGS: "irricom_settings",
  SITES: "irricom_sites",
};

// Helper to trigger storage event for real-time updates
const triggerStorageEvent = (key: string) => {
  window.dispatchEvent(new Event('storage'));
};

// Get the currently selected site ID if any
const getSelectedSiteId = (): string | null => {
  const selectedSiteId = localStorage.getItem('irricom_selected_site');
  return selectedSiteId;
};

// Filter data based on user's site access
const filterBySiteAccess = async <T extends { siteId?: string }>(data: T[]): Promise<T[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  // Master can see all data or filter by selected site
  if (user.role === 'master') {
    const selectedSiteId = getSelectedSiteId();
    if (selectedSiteId) {
      return data.filter(item => item.siteId === selectedSiteId);
    }
    return data;
  }
  
  // Site users can only see their site's data
  return data.filter(item => item.siteId === user.siteId);
};

// Store the selected site ID
export const setSelectedSite = (siteId: string | null): void => {
  if (siteId) {
    localStorage.setItem('irricom_selected_site', siteId);
  } else {
    localStorage.removeItem('irricom_selected_site');
  }
  triggerStorageEvent('irricom_selected_site');
};

// Get the selected site ID
export const getSelectedSite = (): string | null => {
  return getSelectedSiteId();
};

// Employee functions
export const getEmployees = async (): Promise<Employee[]> => {
  const employees = await getEmployeesFromSupabase();
  return employees;
};

export const saveEmployee = async (employee: Employee): Promise<Employee | null> => {
  return saveEmployeeToSupabase(employee);
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  return deleteEmployeeFromSupabase(id);
};

// Test functions
export const getTests = async (): Promise<TestResult[]> => {
  const tests = await getTestsFromSupabase();
  return tests;
};

export const saveTest = async (test: TestResult): Promise<TestResult | null> => {
  return saveTestToSupabase(test);
};

export const deleteTest = async (id: string): Promise<boolean> => {
  return deleteTestFromSupabase(id);
};

// Draw functions
export const getDraws = async (): Promise<DrawResult[]> => {
  const draws = await getDrawsFromSupabase();
  return draws;
};

export const saveDraw = async (draw: DrawResult): Promise<DrawResult | null> => {
  return saveDrawToSupabase(draw);
};

export const deleteDraw = async (id: string): Promise<boolean> => {
  return deleteDrawFromSupabase(id);
};

// Site functions
export const getSites = async (): Promise<Site[]> => {
  try {
    const sites = await getSitesFromSupabase();
    if (!sites || sites.length === 0) {
      // If no sites, return a default empty array
      return [];
    }
    return sites;
  } catch (error) {
    console.error("Error fetching sites:", error);
    return [];
  }
};

export const saveSite = async (site: Site): Promise<Site | null> => {
  return saveSiteToSupabase(site);
};

export const deleteSite = async (id: string): Promise<boolean> => {
  return deleteSiteFromSupabase(id);
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
export const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
