"use client";

import { useEffect, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Plus,
  Save,
  Settings,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { Label } from "@/components/ui";
import {
  useServiceCategories,
  useServiceLocations,
  useSystemSettings,
} from "@/hooks";

const colorOptions = [
  {
    value: "bg-yellow-100 text-yellow-800",
    label: "Yellow",
    color: "bg-yellow-100",
  },
  { value: "bg-blue-100 text-blue-800", label: "Blue", color: "bg-blue-100" },
  {
    value: "bg-green-100 text-green-800",
    label: "Green",
    color: "bg-green-100",
  },
  {
    value: "bg-purple-100 text-purple-800",
    label: "Purple",
    color: "bg-purple-100",
  },
  {
    value: "bg-orange-100 text-orange-800",
    label: "Orange",
    color: "bg-orange-100",
  },
  { value: "bg-pink-100 text-pink-800", label: "Pink", color: "bg-pink-100" },
  { value: "bg-gray-100 text-gray-800", label: "Gray", color: "bg-gray-100" },
];

const iconOptions = [
  "zap",
  "wrench",
  "car",
  "wind",
  "hammer",
  "paintbrush",
  "settings",
  "tool",
  "home",
  "phone",
];

export default function AdminManagement() {
  // Use the hooks to get data and loading states
  const {
    locations: hookLocations,
    loading: locationsLoading,
    error: locationsError,
  } = useServiceLocations();

  const {
    categories: hookCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useServiceCategories();

  const {
    settings: hookSettings,
    loading: settingsLoading,
    error: settingsError,
  } = useSystemSettings();

  const [activeTab, setActiveTab] = useState("categories");

  // Local state for managing data
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  // Update local state when hook data changes
  useEffect(() => {
    if (hookCategories.length > 0) {
      setCategories(hookCategories);
    }
  }, [hookCategories]);

  useEffect(() => {
    if (hookLocations.length > 0) {
      setLocations(hookLocations);
    }
  }, [hookLocations]);

  useEffect(() => {
    if (hookSettings.length > 0) {
      setSettings(hookSettings);
    }
  }, [hookSettings]);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);

  // Edit states
  const [editingCategory, setEditingCategory] = useState<any>();
  const [editingLocation, setEditingLocation] = useState<any>();
  const [editingSetting, setEditingSetting] = useState<any>();

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    value: "",
    label: "",
    icon: "settings",
    colorClass: "bg-gray-100 text-gray-800",
    description: "",
    isActive: true,
    sortOrder: 0,
    rateMin: 500,
    rateTypical: 1000,
    rateMax: 2000,
  });
  const [locationForm, setLocationForm] = useState({
    name: "",
    region: "",
    county: "",
    isActive: true,
    sortOrder: 0,
  });
  const [settingForm, setSettingForm] = useState({
    key: "",
    value: "",
    category: "features",
    description: "",
  });

  // Category functions
  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories(
        categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...editingCategory, ...categoryForm }
            : cat
        )
      );
    } else {
      const newCategory = {
        id: Date.now().toString(),
        ...categoryForm,
        sortOrder: categories.length + 1,
      };
      setCategories([...categories, newCategory]);
    }
    setShowCategoryModal(false);
    resetCategoryForm();
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      value: "",
      label: "",
      icon: "settings",
      colorClass: "bg-gray-100 text-gray-800",
      description: "",
      isActive: true,
      sortOrder: 0,
      rateMin: 500,
      rateTypical: 1000,
      rateMax: 2000,
    });
    setEditingCategory(null);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const toggleCategoryActive = (id: string) => {
    setCategories(
      categories.map(cat =>
        cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  const moveCategoryOrder = (id: string, direction: string) => {
    const index = categories.findIndex(cat => cat.id === id);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < categories.length - 1)
    ) {
      const newCategories = [...categories];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newCategories[index], newCategories[targetIndex]] = [
        newCategories[targetIndex],
        newCategories[index],
      ];

      // Update sort orders
      newCategories.forEach((cat, idx) => {
        cat.sortOrder = idx + 1;
      });

      setCategories(newCategories);
    }
  };

  // Location functions
  const handleSaveLocation = () => {
    if (editingLocation) {
      setLocations(
        locations.map(loc =>
          loc.id === editingLocation.id
            ? { ...editingLocation, ...locationForm }
            : loc
        )
      );
    } else {
      const newLocation = {
        id: Date.now().toString(),
        ...locationForm,
        sortOrder: locations.length + 1,
      };
      setLocations([...locations, newLocation]);
    }
    setShowLocationModal(false);
    resetLocationForm();
  };

  const resetLocationForm = () => {
    setLocationForm({
      name: "",
      region: "",
      county: "",
      isActive: true,
      sortOrder: 0,
    });
    setEditingLocation(null);
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    setLocationForm(location);
    setShowLocationModal(true);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const toggleLocationActive = (id: string) => {
    setLocations(
      locations.map(loc =>
        loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
      )
    );
  };

  // Setting functions
  const handleSaveSetting = () => {
    let processedValue = settingForm.value;

    // Try to parse JSON for complex values
    try {
      processedValue = JSON.parse(processedValue);
    } catch {
      // Keep as string if not valid JSON
    }

    if (editingSetting) {
      setSettings(
        settings.map(setting =>
          setting.id === editingSetting.id
            ? { ...editingSetting, ...settingForm, value: processedValue }
            : setting
        )
      );
    } else {
      const newSetting = {
        id: Date.now().toString(),
        ...settingForm,
        value: processedValue,
      };
      setSettings([...settings, newSetting]);
    }
    setShowSettingModal(false);
    resetSettingForm();
  };

  const resetSettingForm = () => {
    setSettingForm({
      key: "",
      value: "",
      category: "features",
      description: "",
    });
    setEditingSetting(null);
  };

  const handleEditSetting = (setting: any) => {
    setEditingSetting(setting);
    setSettingForm({
      ...setting,
      value:
        typeof setting.value === "object"
          ? JSON.stringify(setting.value, null, 2)
          : setting.value,
    });
    setShowSettingModal(true);
  };

  const handleDeleteSetting = (id: string) => {
    setSettings(settings.filter(setting => setting.id !== id));
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  // Error component
  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="rounded-lg bg-red-50 p-4 text-red-800">
      <p>Error loading data: {error}</p>
    </div>
  );

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="rounded-lg bg-gray-50 p-8 text-center">
      <p className="text-gray-600">{message}</p>
    </div>
  );

  const renderTableContent = () => {
    if (categoriesLoading) {
      return <LoadingSpinner />;
    }

    if (categories.length === 0) {
      return (
        <EmptyState message="No service categories found. Add your first category to get started." />
      );
    }

    return (
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Rate Range (KES)
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr
                  key={category.id}
                  className={!category.isActive ? "opacity-50" : ""}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">
                        {category.sortOrder}
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCategoryOrder(category.id, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveCategoryOrder(category.id, "down")}
                          disabled={index === categories.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.label}
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.value}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.icon}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${category.colorClass}`}
                    >
                      Sample
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {category.rateMin?.toLocaleString() || "N/A"} -{" "}
                      {category.rateMax?.toLocaleString() || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Typical: {category.rateTypical?.toLocaleString() || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleCategoryActive(category.id)}
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {category.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLocationsTable = () => {
    if (locationsLoading) {
      return <LoadingSpinner />;
    }

    if (locations.length === 0) {
      return (
        <EmptyState message="No service locations found. Add your first location to get started." />
      );
    }

    return (
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  County
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map(location => (
                <tr
                  key={location.id}
                  className={!location.isActive ? "opacity-50" : ""}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {location.region}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {location.county}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleLocationActive(location.id)}
                      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        location.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {location.isActive ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {location.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettingsGrid = () => {
    if (settingsLoading) {
      return <LoadingSpinner />;
    }

    if (settings.length === 0) {
      return (
        <EmptyState message="No system settings found. Add your first setting to get started." />
      );
    }

    // Group settings by category
    const groupedSettings = settings.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) acc[setting.category] = [];
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedSettings).map(
          ([category, categorySettings]: any) => (
            <div key={category} className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold capitalize">
                {category} Settings
              </h3>
              <div className="space-y-3">
                {categorySettings.map((setting: any) => (
                  <div
                    key={setting.id}
                    className="border-b pb-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {setting.key}
                        </div>
                        {setting.description && (
                          <div className="text-xs text-gray-500">
                            {setting.description}
                          </div>
                        )}
                        <div className="mt-1 text-sm text-gray-600">
                          {typeof setting.value === "object"
                            ? JSON.stringify(setting.value)
                            : String(setting.value)}
                        </div>
                      </div>
                      <div className="ml-2 flex items-center gap-1">
                        <button
                          onClick={() => handleEditSetting(setting)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
        <p className="text-gray-600">
          Manage categories, locations, and system settings
        </p>
      </div>

      <div className="container mx-auto p-6">
        {/* Tabs */}
        <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
          {[
            { id: "categories", label: "Service Categories", icon: Tag },
            { id: "locations", label: "Service Locations", icon: MapPin },
            { id: "settings", label: "System Settings", icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Service Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Service Categories</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>

            {categoriesError && <ErrorMessage error={categoriesError} />}

            {renderTableContent()}
          </div>
        )}

        {/* Service Locations Tab */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Service Locations</h2>
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>

            {locationsError && <ErrorMessage error={locationsError} />}

            {renderLocationsTable()}
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Settings</h2>
              <button
                onClick={() => setShowSettingModal(true)}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Setting
              </button>
            </div>

            {settingsError && <ErrorMessage error={settingsError} />}

            {renderSettingsGrid()}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  type="text"
                  value={categoryForm.label}
                  onChange={e =>
                    setCategoryForm({ ...categoryForm, label: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Electrical Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Value
                </label>
                <input
                  type="text"
                  value={categoryForm.value}
                  onChange={e =>
                    setCategoryForm({ ...categoryForm, value: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., electrical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <select
                  value={categoryForm.icon}
                  onChange={e =>
                    setCategoryForm({ ...categoryForm, icon: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setCategoryForm({
                          ...categoryForm,
                          colorClass: color.value,
                        })
                      }
                      className={`flex items-center gap-2 rounded-md border p-2 text-sm ${
                        categoryForm.colorClass === color.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded ${color.color}`} />
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Description
                </Label>
                <textarea
                  value={categoryForm.description}
                  onChange={e =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700">
                  Rate Suggestions (KES)
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Minimum
                    </label>
                    <input
                      type="number"
                      value={categoryForm.rateMin || 500}
                      onChange={e =>
                        setCategoryForm({
                          ...categoryForm,
                          rateMin: parseInt(e.target.value) || 500,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      min="100"
                      max="50000"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Typical
                    </label>
                    <input
                      type="number"
                      value={categoryForm.rateTypical || 1000}
                      onChange={e =>
                        setCategoryForm({
                          ...categoryForm,
                          rateTypical: parseInt(e.target.value) || 1000,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      min="100"
                      max="50000"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Maximum
                    </label>
                    <input
                      type="number"
                      value={categoryForm.rateMax || 2000}
                      onChange={e =>
                        setCategoryForm({
                          ...categoryForm,
                          rateMax: parseInt(e.target.value) || 2000,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      min="100"
                      max="50000"
                      placeholder="2000"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Suggested hourly rates for this service category
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="categoryActive"
                  checked={categoryForm.isActive}
                  onChange={e =>
                    setCategoryForm({
                      ...categoryForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="categoryActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveCategory}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Category
              </button>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  resetCategoryForm();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  resetLocationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={e =>
                    setLocationForm({ ...locationForm, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Nairobi CBD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <input
                  type="text"
                  value={locationForm.region}
                  onChange={e =>
                    setLocationForm({ ...locationForm, region: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  County
                </label>
                <input
                  type="text"
                  value={locationForm.county}
                  onChange={e =>
                    setLocationForm({ ...locationForm, county: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Nairobi County"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="locationActive"
                  checked={locationForm.isActive}
                  onChange={e =>
                    setLocationForm({
                      ...locationForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="locationActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveLocation}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Location
              </button>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  resetLocationForm();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setting Modal */}
      {showSettingModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingSetting ? "Edit Setting" : "Add New Setting"}
              </h3>
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  resetSettingForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Setting Key
                </label>
                <input
                  type="text"
                  value={settingForm.key}
                  onChange={e =>
                    setSettingForm({ ...settingForm, key: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., max_budget_limit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={settingForm.category}
                  onChange={e =>
                    setSettingForm({ ...settingForm, category: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="features">Features</option>
                  <option value="pricing">Pricing</option>
                  <option value="limits">Limits</option>
                  <option value="notifications">Notifications</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={settingForm.description}
                  onChange={e =>
                    setSettingForm({
                      ...settingForm,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Brief description of this setting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Value
                </label>
                <textarea
                  value={settingForm.value}
                  onChange={e =>
                    setSettingForm({ ...settingForm, value: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder='Simple value or JSON object like {"min": 100, "max": 1000}'
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a simple value (text, number, true/false) or a JSON
                  object for complex settings
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveSetting}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Setting
              </button>
              <button
                onClick={() => {
                  setShowSettingModal(false);
                  resetSettingForm();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
