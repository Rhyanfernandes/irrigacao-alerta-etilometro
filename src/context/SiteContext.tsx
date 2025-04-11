
import React, { createContext, useContext, useState, useEffect } from "react";
import { Site } from "@/types";
import { useAuth } from "./AuthContext";
import { getSites, getSelectedSite, setSelectedSite } from "@/lib/storage";
import { toast } from "sonner";

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
        console.log('Sites carregados:', sitesData);
        setSites(sitesData);
        
        // Find the current site if user is a site user
        if (user?.role === 'site' && user.siteId) {
          console.log('Usuário de obra, definindo site atual:', user.siteId);
          const site = sitesData.find(s => s.id === user.siteId) || null;
          setCurrentSite(site);
          setSelectedSiteId(user.siteId);
        } else if (user?.role === 'master') {
          // Master user - check if there's a stored selected site
          const storedSiteId = getSelectedSite();
          console.log('Usuário master, site armazenado:', storedSiteId);
          
          if (storedSiteId) {
            setSelectedSiteId(storedSiteId);
            const site = sitesData.find(s => s.id === storedSiteId) || null;
            setCurrentSite(site);
          } else if (sitesData.length > 0) {
            // Se não há site selecionado mas existem sites, selecionar o primeiro
            setSelectedSiteId(sitesData[0].id);
            setCurrentSite(sitesData[0]);
            setSelectedSite(sitesData[0].id);
            console.log('Nenhum site selecionado, selecionando o primeiro:', sitesData[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading sites:", error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSites();
    }
  }, [user]);

  // Update currentSite whenever selectedSiteId changes
  useEffect(() => {
    if (selectedSiteId && sites.length > 0) {
      const site = sites.find(s => s.id === selectedSiteId) || null;
      console.log('Site selecionado atualizado:', site);
      setCurrentSite(site);
    } else if (!selectedSiteId) {
      setCurrentSite(null);
    }
  }, [selectedSiteId, sites]);

  const selectSite = (siteId: string | null) => {
    // Only master can switch sites
    if (user?.role === 'master') {
      console.log('Alterando site para:', siteId);
      setSelectedSiteId(siteId);
      setSelectedSite(siteId);
      
      if (siteId && sites.length > 0) {
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
