import { User, LoginCredentials } from "@/types/auth";
import { supabase, convertSupabaseUser } from "./supabase";

// Storage keys
const AUTH_USER_KEY = "irricom_auth_user";

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const user = convertSupabaseUser(data.user);
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Save user to localStorage for persistence
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  return user;
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  // Primeiro tenta pegar do localStorage
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }

  // Se não encontrar no localStorage, tenta pegar do Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
  
  if (error || !supabaseUser) {
    return null;
  }

  const user = convertSupabaseUser(supabaseUser);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  return user;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

export const canAccessSite = async (siteId: string | undefined): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // Master can access all sites
  if (user.role === "master") return true;
  
  // Site users can only access their own site
  return user.siteId === siteId;
};
