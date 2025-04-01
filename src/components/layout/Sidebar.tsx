
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
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
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
    <SidebarComponent
      collapsible="icon"
    >
      <SidebarHeader className="flex items-center gap-2 py-4">
        <Droplets className="h-6 w-6 text-green-600" />
        <span className="font-bold text-lg">Irricom</span>
        <SidebarTrigger className="ml-auto" />
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
      </SidebarContent>
    </SidebarComponent>
  );
}
