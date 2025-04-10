
import React, { useEffect } from "react";
import { useSite } from "@/context/SiteContext";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const SiteSwitcher = () => {
  const { selectedSiteId, selectSite, sites, isViewingAllSites, currentSite, setViewAllSites } = useSite();
  const { user } = useAuth();

  useEffect(() => {
    console.log('SiteSwitcher - sites disponíveis:', sites);
    console.log('SiteSwitcher - site selecionado:', selectedSiteId);
    console.log('SiteSwitcher - site atual:', currentSite);
    console.log('SiteSwitcher - visualizando todas as obras:', isViewingAllSites);
    console.log('SiteSwitcher - usuário:', user?.role, user?.siteId);
  }, [sites, selectedSiteId, currentSite, isViewingAllSites, user]);

  // Only render for master users
  if (!user || user.role !== "master") {
    return null;
  }

  const handleSiteChange = (value: string) => {
    console.log("Alterando site para:", value);
    if (value === "all") {
      selectSite(null);
      setViewAllSites(true);
      toast.success("Visualizando todas as obras");
    } else {
      const selectedSite = sites.find(site => site.id === value);
      selectSite(value);
      setViewAllSites(false);
      if (selectedSite) {
        toast.success(`Obra ${selectedSite.name} selecionada`);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border shadow-sm w-full md:w-auto">
      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
      <Select
        value={isViewingAllSites ? "all" : (selectedSiteId || "")}
        onValueChange={handleSiteChange}
      >
        <SelectTrigger className="h-8 min-w-[180px] border-none shadow-none focus:ring-0 px-2">
          <SelectValue placeholder="Selecionar Obra" />
        </SelectTrigger>
        <SelectContent className="bg-white max-h-80 overflow-y-auto">
          <SelectItem value="all" className="font-semibold text-blue-600">
            Todas as Obras
          </SelectItem>
          {Array.isArray(sites) && sites.length > 0 ? (
            sites.map(site => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              Nenhuma obra disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
