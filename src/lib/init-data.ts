
import { saveSite } from "./storage";
import { Site } from "@/types";

// Initialize sites data
export const initializeSites = () => {
  const sites: Site[] = [
    {
      id: "brumadinho",
      name: "Brumadinho",
      location: "Minas Gerais",
      createdAt: new Date()
    },
    {
      id: "salobo",
      name: "Salobo",
      location: "Pará",
      createdAt: new Date()
    },
    {
      id: "hydro",
      name: "Hydro",
      location: "Pará",
      createdAt: new Date()
    }
  ];

  // Save each site
  sites.forEach(site => saveSite(site));

  return sites;
};
