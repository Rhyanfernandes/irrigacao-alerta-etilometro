
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState, LoginCredentials } from "@/types/auth";
import { login as authLogin, logout as authLogout, getCurrentUser, isAuthenticated as checkAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authLogin(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.name}!`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
