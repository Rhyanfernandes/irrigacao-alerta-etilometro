
import React from "react";
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

export const SiteSwitcher = () => {
  const { selectedSiteId, selectSite, sites, isViewingAllSites, currentSite } = useSite();
  const { user } = useAuth();

  // Only render for master users
  if (!user || user.role !== "master") {
    return null;
  }

  const handleSiteChange = (value: string) => {
    console.log("Changing site to:", value);
    selectSite(value === "all" ? null : value);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border shadow-sm w-full md:w-auto">
      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
      <Select
        value={selectedSiteId || "all"}
        onValueChange={handleSiteChange}
      >
        <SelectTrigger className="h-8 min-w-[180px] border-none shadow-none focus:ring-0 px-2">
          <SelectValue placeholder="Selecionar Obra" />
        </SelectTrigger>
        <SelectContent className="bg-white max-h-80 overflow-y-auto">
          <SelectItem value="all" className="font-semibold text-blue-600">
            Todas as Obras
          </SelectItem>
          {Array.isArray(sites) && sites.map(site => (
            <SelectItem key={site.id} value={site.id}>
              {site.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
