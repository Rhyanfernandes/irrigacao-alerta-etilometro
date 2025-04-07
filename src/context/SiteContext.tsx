
import React, { createContext, useContext, useState, useEffect } from "react";
import { Site } from "@/types";
import { useAuth } from "./AuthContext";
import { getSites, setSelectedSite } from "@/lib/storage";

interface SiteContextType {
  selectedSiteId: string | null;
  selectSite: (siteId: string | null) => void;
  sites: Site[];
  isViewingAllSites: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    // Load sites
    setSites(getSites());

    // Initialize selected site
    if (user) {
      if (user.role === 'site') {
        // Site users can only see their own site
        setSelectedSiteId(user.siteId || null);
      } else {
        // Master user starts with all sites view (null means all sites)
        setSelectedSiteId(null);
      }
    }
  }, [user]);

  const selectSite = (siteId: string | null) => {
    // Only master can switch sites
    if (user?.role === 'master') {
      setSelectedSiteId(siteId);
      // Store selected site in localStorage to persist between page refreshes
      setSelectedSite(siteId);
    }
  };

  const isViewingAllSites = selectedSiteId === null && user?.role === 'master';

  return (
    <SiteContext.Provider
      value={{
        selectedSiteId,
        selectSite,
        sites,
        isViewingAllSites
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
};
