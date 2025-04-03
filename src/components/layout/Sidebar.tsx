
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuButtonVariant,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ClipboardCheck,
  Home,
  Users,
  BarChart3,
  Droplets,
  Wine,
  Shuffle,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserProfileButton } from "./UserProfileButton";

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Colaboradores",
      url: "/employees",
      icon: Users,
    },
    {
      title: "Testes",
      url: "/tests",
      icon: Wine,
    },
    {
      title: "Sorteios",
      url: "/draws",
      icon: Shuffle,
    },
    {
      title: "Relatórios",
      url: "/reports",
      icon: BarChart3,
    },
  ];

  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader className="flex items-center gap-2 py-4">
        <Droplets className="h-6 w-6 text-green-600" />
        <span className="font-bold text-lg">Irricom</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="md:hidden">
            <UserProfileButton />
          </div>
          <SidebarTrigger className="h-8 w-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="md:hidden">
                <SidebarMenuButton 
                  asChild 
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                >
                  <button className="flex items-center gap-3 text-red-600">
                    <LogOut className="h-5 w-5" />
                    <span>Sair</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}
