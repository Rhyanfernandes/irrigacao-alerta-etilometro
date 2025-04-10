
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const UserProfileButton = () => {
  const { user, logout } = useAuth();
  const { sites, selectSite, selectedSiteId, isViewingAllSites, currentSite } = useSite();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleSelectSite = (siteId: string | null) => {
    selectSite(siteId);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
          <p className="text-xs font-semibold mt-1 text-blue-600">
            {user.role === "master" 
              ? "Administrador Master" 
              : `Obra: ${user.siteName || (currentSite ? currentSite.name : "Não especificada")}`}
          </p>
        </div>
        <DropdownMenuSeparator />
        
        {user.role === "master" && (
          <>
            <DropdownMenuLabel className="text-xs font-semibold">
              Visualizar Dados de Obra
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={isViewingAllSites ? "bg-blue-50" : ""} 
                onClick={() => handleSelectSite(null)}
              >
                <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                <span>Todas as Obras</span>
                {isViewingAllSites && (
                  <Badge variant="outline" className="ml-auto text-xs px-1 py-0 h-5">
                    Ativo
                  </Badge>
                )}
              </DropdownMenuItem>
              
              {Array.isArray(sites) && sites.map(site => (
                <DropdownMenuItem 
                  key={site.id} 
                  className={selectedSiteId === site.id ? "bg-green-50" : ""}
                  onClick={() => handleSelectSite(site.id)}
                >
                  <Building2 className="mr-2 h-4 w-4 text-green-600" />
                  <span>{site.name}</span>
                  {selectedSiteId === site.id && (
                    <Badge variant="outline" className="ml-auto text-xs px-1 py-0 h-5">
                      Ativo
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
