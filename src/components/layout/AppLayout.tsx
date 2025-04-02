
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar currentPath={currentPath} />
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto py-6 px-4 md:px-6">
            {user?.role === 'site' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-700">
                  Você está conectado na obra: <span className="font-bold">{user.siteName}</span>
                </p>
              </div>
            )}
            {user?.role === 'master' && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium text-purple-700">
                  <span className="font-bold">Conta Master</span> - Você tem acesso a todas as obras
                </p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
