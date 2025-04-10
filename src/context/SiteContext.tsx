
import React, { createContext, useContext, useState, useEffect } from "react";
import { Site } from "@/types";
import { useAuth } from "./AuthContext";
import { getSites, getSelectedSite, setSelectedSite } from "@/lib/storage";

interface SiteContextType {
  selectedSiteId: string | null;
  selectSite: (siteId: string | null) => void;
  sites: Site[];
  isViewingAllSites: boolean;
  currentSite: Site | null;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sites
    const loadSites = async () => {
      try {
        const sitesData = await getSites();
        setSites(sitesData);
        
        // Find the current site if user is a site user
        if (user?.role === 'site' && user.siteId) {
          const site = sitesData.find(s => s.id === user.siteId) || null;
          setCurrentSite(site);
        }
      } catch (error) {
        console.error("Error loading sites:", error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    loadSites();

    // Initialize selected site
    if (user) {
      if (user.role === 'site') {
        // Site users can only see their own site
        setSelectedSiteId(user.siteId || null);
      } else {
        // Master user - check if there's a stored selected site
        const storedSiteId = getSelectedSite();
        setSelectedSiteId(storedSiteId);
        
        // If a site is selected, find it in the loaded sites
        if (storedSiteId) {
          loadSites().then(() => {
            const site = sites.find(s => s.id === storedSiteId) || null;
            setCurrentSite(site);
          });
        }
      }
    }
  }, [user]);

  // Update currentSite whenever selectedSiteId changes
  useEffect(() => {
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId) || null;
      setCurrentSite(site);
    } else {
      setCurrentSite(null);
    }
  }, [selectedSiteId, sites]);

  const selectSite = (siteId: string | null) => {
    // Only master can switch sites
    if (user?.role === 'master') {
      setSelectedSiteId(siteId);
      // Store selected site in localStorage to persist between page refreshes
      setSelectedSite(siteId);
      
      if (siteId) {
        const site = sites.find(s => s.id === siteId) || null;
        setCurrentSite(site);
      } else {
        setCurrentSite(null);
      }
    }
  };

  const isViewingAllSites = selectedSiteId === null && user?.role === 'master';

  return (
    <SiteContext.Provider
      value={{
        selectedSiteId,
        selectSite,
        sites,
        isViewingAllSites,
        currentSite
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
