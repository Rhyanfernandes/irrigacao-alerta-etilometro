
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
  setViewAllSites: (viewAll: boolean) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [isViewingAllSites, setIsViewingAllSites] = useState(false);
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
          // Verificar se o usuário quer ver todas as obras
          const viewAllSitesStored = localStorage.getItem('irricom_view_all_sites') === 'true';
          setIsViewingAllSites(viewAllSitesStored);
          
          if (viewAllSitesStored) {
            console.log('Visualizando todas as obras');
            setSelectedSiteId(null);
            setCurrentSite(null);
          } else {
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
      
      if (siteId) {
        const site = sites.find(s => s.id === siteId) || null;
        setCurrentSite(site);
        setIsViewingAllSites(false);
        localStorage.setItem('irricom_view_all_sites', 'false');
      } else {
        setCurrentSite(null);
        setIsViewingAllSites(true);
        localStorage.setItem('irricom_view_all_sites', 'true');
      }
    }
  };

  const setViewAllSites = (viewAll: boolean) => {
    if (user?.role === 'master') {
      setIsViewingAllSites(viewAll);
      localStorage.setItem('irricom_view_all_sites', viewAll.toString());
      
      if (viewAll) {
        setSelectedSiteId(null);
        setCurrentSite(null);
        setSelectedSite(null);
      } else if (sites.length > 0 && !selectedSiteId) {
        // Se desativar a visualização de todas as obras, selecionar a primeira
        setSelectedSiteId(sites[0].id);
        setCurrentSite(sites[0]);
        setSelectedSite(sites[0].id);
      }
    }
  };

  return (
    <SiteContext.Provider
      value={{
        selectedSiteId,
        selectSite,
        sites,
        isViewingAllSites,
        currentSite,
        setViewAllSites
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
