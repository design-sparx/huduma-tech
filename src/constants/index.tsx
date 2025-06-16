// import {
//   Car,
//   Hammer,
//   Paintbrush,
//   Settings,
//   Wind,
//   Wrench,
//   Zap,
// } from "lucide-react";
//
// import {
//   getCachedServiceCategories,
//   getCachedServiceLocations,
// } from "@/lib/services/dynamic-data";
//
// // Icon mapping for dynamic categories
// export const ICON_MAP = {
//   zap: Zap,
//   wrench: Wrench,
//   car: Car,
//   wind: Wind,
//   hammer: Hammer,
//   paintbrush: Paintbrush,
//   settings: Settings,
//   // Add more icons as needed
// };
//
// // Legacy support - these will be populated from database
// export let SERVICE_CATEGORIES: Array<{
//   value: string;
//   label: string;
//   icon: any;
//   color: string;
// }> = [];
//
// export let KENYAN_LOCATIONS: string[] = [];
//
// // Function to initialize constants from database
// export async function initializeConstants() {
//   try {
//     // Load categories
//     const categories = await getCachedServiceCategories();
//     SERVICE_CATEGORIES = categories.map(cat => ({
//       value: cat.value,
//       label: cat.label,
//       icon: ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Settings,
//       color: cat.colorClass,
//     }));
//
//     // Load locations
//     const locations = await getCachedServiceLocations();
//     KENYAN_LOCATIONS = locations.map(loc => loc.name);
//
//     console.log("Constants initialized from database");
//   } catch (error) {
//     console.error("Failed to initialize constants:", error);
//
//     // Fallback to hardcoded values if database fails
//     SERVICE_CATEGORIES = [
//       {
//         value: "electrical",
//         label: "Electrical Services",
//         icon: Zap,
//         color: "bg-yellow-100 text-yellow-800",
//       },
//       {
//         value: "plumbing",
//         label: "Plumbing Services",
//         icon: Wrench,
//         color: "bg-blue-100 text-blue-800",
//       },
//       {
//         value: "automotive",
//         label: "Car Services",
//         icon: Car,
//         color: "bg-green-100 text-green-800",
//       },
//       {
//         value: "hvac",
//         label: "HVAC Services",
//         icon: Wind,
//         color: "bg-purple-100 text-purple-800",
//       },
//       {
//         value: "carpentry",
//         label: "Carpentry",
//         icon: Hammer,
//         color: "bg-orange-100 text-orange-800",
//       },
//       {
//         value: "painting",
//         label: "Painting",
//         icon: Paintbrush,
//         color: "bg-pink-100 text-pink-800",
//       },
//       {
//         value: "general_maintenance",
//         label: "General Maintenance",
//         icon: Settings,
//         color: "bg-gray-100 text-gray-800",
//       },
//     ];
//
//     KENYAN_LOCATIONS = [
//       "Nairobi CBD",
//       "Westlands",
//       "Karen",
//       "Kilimani",
//       "Lavington",
//       "Parklands",
//       "Industrial Area",
//       "Eastleigh",
//       "Kasarani",
//       "Embakasi",
//       "Mombasa",
//       "Kisumu",
//       "Nakuru",
//       "Eldoret",
//       "Thika",
//       "Machakos",
//     ];
//   }
// }
