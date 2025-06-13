"use client";

import Link from "next/link";

import {
  Car,
  Hammer,
  Paintbrush,
  Settings,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

const serviceCategories = [
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

export function ServiceCategoriesBlock() {
  return (
    <div>
      <h3 className="mb-6 text-center text-2xl font-bold">Our Services</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {serviceCategories.map(category => {
          const Icon = category.icon;
          return (
            <Link
              key={category.value}
              href={`/search?category=${category.value}`}
              className="cursor-pointer rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
            >
              <div
                className={`h-12 w-12 rounded-lg ${category.color} mb-3 flex items-center justify-center`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold">{category.label}</h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
