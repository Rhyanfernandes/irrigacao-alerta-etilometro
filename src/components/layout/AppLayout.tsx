
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";
import { SiteSwitcher } from "./SiteSwitcher";
import { UserProfileButton } from "./UserProfileButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  const { selectedSiteId, isViewingAllSites } = useSite();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <Sidebar currentPath={currentPath} />
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto py-6 px-4 md:px-6">
            {/* Site Notification Banner */}
            <div className="mb-4 flex flex-col gap-2">
              {user?.role === 'site' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 w-full">
                  <p className="font-medium text-blue-700">
                    Você está conectado na obra: <span className="font-bold">{user.siteName}</span>
                  </p>
                </div>
              )}
              {user?.role === 'master' && isViewingAllSites && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full">
                  <p className="font-medium text-purple-700">
                    <span className="font-bold">Conta Master</span> - Visualizando todas as obras
                  </p>
                  <SiteSwitcher />
                </div>
              )}
              {user?.role === 'master' && !isViewingAllSites && selectedSiteId && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full">
                  <p className="font-medium text-green-700">
                    <span className="font-bold">Conta Master</span> - Filtrando dados para obra específica
                  </p>
                  <SiteSwitcher />
                </div>
              )}
              
              <div className={`${isMobile ? "flex" : "hidden md:flex"} justify-end`}>
                <UserProfileButton />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
