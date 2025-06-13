import {
  Car,
  Hammer,
  Paintbrush,
  Settings,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

export const SERVICE_CATEGORIES = [
  {
    value: "electrical",
    label: "Electrical Services",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "plumbing",
    label: "Plumbing Services",
    icon: Wrench,
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "automotive",
    label: "Car Services",
    icon: Car,
    color: "bg-green-100 text-green-800",
  },
  {
    value: "hvac",
    label: "HVAC Services",
    icon: Wind,
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "carpentry",
    label: "Carpentry",
    icon: Hammer,
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "painting",
    label: "Painting",
    icon: Paintbrush,
    color: "bg-pink-100 text-pink-800",
  },
  {
    value: "general_maintenance",
    label: "General Maintenance",
    icon: Settings,
    color: "bg-gray-100 text-gray-800",
  },
];

export const KENYAN_LOCATIONS = [
  "Nairobi CBD",
  "Westlands",
  "Karen",
  "Kilimani",
  "Lavington",
  "Parklands",
  "Industrial Area",
  "Eastleigh",
  "Kasarani",
  "Embakasi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Machakos",
];
