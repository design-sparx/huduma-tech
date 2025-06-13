import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signIn, signUp } from "@/lib/services/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

const kenyanLocations = [
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

export function AuthModal({
  isOpen,
  onClose,
  mode,
  onToggleMode,
}: AuthModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        });
      } else {
        await signIn(formData.email, formData.password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                type="tel"
                placeholder="Phone Number (+254...)"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
              <Select
                value={formData.location}
                onValueChange={value =>
                  setFormData({ ...formData, location: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {kenyanLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <div className="flex space-x-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Loading..."
                : mode === "signin"
                  ? "Sign In"
                  : "Sign Up"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-green-600 hover:underline"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
