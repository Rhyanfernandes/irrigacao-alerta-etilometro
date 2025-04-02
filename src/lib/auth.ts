
import { User, LoginCredentials } from "@/types/auth";

// Storage keys
const AUTH_USER_KEY = "irricom_auth_user";

// Mock users (in a real app, this would be in a database)
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@irricom.com",
    name: "Administrador Master",
    role: "master",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "obra1@irricom.com",
    name: "Obra Centro",
    role: "site",
    siteId: "obra1",
    siteName: "Obra Centro",
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "obra2@irricom.com",
    name: "Obra Norte",
    role: "site",
    siteId: "obra2",
    siteName: "Obra Norte",
    createdAt: new Date(),
  },
  {
    id: "4",
    email: "obra3@irricom.com",
    name: "Obra Sul",
    role: "site",
    siteId: "obra3",
    siteName: "Obra Sul",
    createdAt: new Date(),
  }
];

// Mock passwords (in a real app, passwords would be hashed)
const MOCK_PASSWORDS: Record<string, string> = {
  "admin@irricom.com": "admin123",
  "obra1@irricom.com": "obra1123",
  "obra2@irricom.com": "obra2123",
  "obra3@irricom.com": "obra3123",
};

export const login = async (credentials: LoginCredentials): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = MOCK_USERS.find(user => user.email === credentials.email);
  
  if (!user || MOCK_PASSWORDS[credentials.email] !== credentials.password) {
    throw new Error("Credenciais inválidas");
  }
  
  // Save user to localStorage
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  
  return user;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson);
    // Ensure dates are properly parsed
    return {
      ...user,
      createdAt: new Date(user.createdAt),
    };
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const canAccessSite = (siteId: string | undefined): boolean => {
  const user = getCurrentUser();
  
  if (!user) return false;
  
  // Master can access all sites
  if (user.role === "master") return true;
  
  // Site users can only access their assigned site
  return user.siteId === siteId;
};
