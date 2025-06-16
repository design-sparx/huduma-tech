// src/lib/admin.ts - Updated to use verification_status only
import { supabase } from "@/lib/supabase";

import type { User } from "@supabase/supabase-js";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
}

export interface PendingProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  location: string;
  hourlyRate: number;
  bio: string;
  experienceYears: number;
  verificationStatus: "pending" | "approved" | "rejected";
  verificationRequestedAt: Date;
  createdAt: Date;
}

export interface PendingReport {
  id: string;
  reporterName: string;
  reportedName: string;
  reportType: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  pendingVerifications: number;
  pendingReports: number;
  pendingRequests: number;
  completedRequests: number;
}

// Check if current user is admin
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error("Error in checkUserIsAdmin:", error);
    return false;
  }
}

// Get admin dashboard statistics
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { data, error } = await supabase
      .from("admin_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totalUsers: 0,
        totalProviders: 0,
        pendingVerifications: 0,
        pendingReports: 0,
        pendingRequests: 0,
        completedRequests: 0,
      };
    }

    return {
      totalUsers: data.total_users || 0,
      totalProviders: data.total_providers || 0,
      pendingVerifications: data.pending_verifications || 0,
      pendingReports: data.pending_reports || 0,
      pendingRequests: data.pending_requests || 0,
      completedRequests: data.completed_requests || 0,
    };
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    return {
      totalUsers: 0,
      totalProviders: 0,
      pendingVerifications: 0,
      pendingReports: 0,
      pendingRequests: 0,
      completedRequests: 0,
    };
  }
}

// Get pending provider verifications
export async function getPendingProviders(): Promise<PendingProvider[]> {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending providers:", error);
      return [];
    }

    return (data || []).map(provider => ({
      id: provider.id,
      name: provider.name,
      email: provider.email,
      phone: provider.phone,
      services: provider.services,
      location: provider.location,
      hourlyRate: provider.hourly_rate,
      bio: provider.bio,
      experienceYears: provider.experience_years,
      verificationStatus: provider.verification_status,
      verificationRequestedAt: new Date(
        provider.verification_requested_at || provider.created_at
      ),
      createdAt: new Date(provider.created_at),
    }));
  } catch (error) {
    console.error("Error in getPendingProviders:", error);
    return [];
  }
}

// Approve provider - uses verification_status only
export async function approveProvider(
  providerId: string,
  adminId: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_providers")
      .update({
        verification_status: "approved", // Single source of truth
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId);

    if (error) {
      console.error("Error approving provider:", error);
      return false;
    }

    // TODO: Send welcome email to provider
    console.log(`Provider ${providerId} approved by admin ${adminId}`);
    return true;
  } catch (error) {
    console.error("Error in approveProvider:", error);
    return false;
  }
}

// Reject provider - uses verification_status only
export async function rejectProvider(
  providerId: string,
  adminId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_providers")
      .update({
        verification_status: "rejected", // Single source of truth
        admin_notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId);

    if (error) {
      console.error("Error rejecting provider:", error);
      return false;
    }

    // TODO: Send rejection email to provider
    console.log(
      `Provider ${providerId} rejected by admin ${adminId}: ${reason}`
    );
    return true;
  } catch (error) {
    console.error("Error in rejectProvider:", error);
    return false;
  }
}

// Get pending reports
export async function getPendingReports(): Promise<PendingReport[]> {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        reporter:reporter_id(name),
        reported_user:reported_user_id(name),
        reported_provider:reported_provider_id(name)
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending reports:", error);
      return [];
    }

    return (data || []).map(report => ({
      id: report.id,
      reporterName: report.reporter?.name || "Unknown",
      reportedName:
        report.reported_user?.name ||
        report.reported_provider?.name ||
        "Unknown",
      reportType: report.report_type,
      description: report.description,
      status: report.status,
      createdAt: new Date(report.created_at),
    }));
  } catch (error) {
    console.error("Error in getPendingReports:", error);
    return [];
  }
}

// Block user or provider
export async function blockUser(
  userId: string,
  reason: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        is_blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error blocking user:", error);
      return false;
    }

    console.log(`User ${userId} blocked by admin ${adminId}: ${reason}`);
    return true;
  } catch (error) {
    console.error("Error in blockUser:", error);
    return false;
  }
}

export async function blockProvider(
  providerId: string,
  reason: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_providers")
      .update({
        is_blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
      })
      .eq("id", providerId);

    if (error) {
      console.error("Error blocking provider:", error);
      return false;
    }

    console.log(
      `Provider ${providerId} blocked by admin ${adminId}: ${reason}`
    );
    return true;
  } catch (error) {
    console.error("Error in blockProvider:", error);
    return false;
  }
}

// Create report
export async function createReport(reportData: {
  reporterId: string;
  reportedUserId?: string;
  reportedProviderId?: string;
  reportedRequestId?: string;
  reportType: string;
  description: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("reports").insert([
      {
        reporter_id: reportData.reporterId,
        reported_user_id: reportData.reportedUserId,
        reported_provider_id: reportData.reportedProviderId,
        reported_request_id: reportData.reportedRequestId,
        report_type: reportData.reportType,
        description: reportData.description,
      },
    ]);

    if (error) {
      console.error("Error creating report:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in createReport:", error);
    return false;
  }
}

// Resolve report
export async function resolveReport(
  reportId: string,
  adminId: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        admin_notes: notes,
        resolved_by: adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      console.error("Error resolving report:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in resolveReport:", error);
    return false;
  }
}

// Enhanced auth context helper
export async function getCurrentUserWithAdminStatus(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return { user: null, isAdmin: false };
    }

    const isAdmin = await checkUserIsAdmin(session.user.id);

    return { user: session.user, isAdmin };
  } catch (error) {
    console.error("Error in getCurrentUserWithAdminStatus:", error);
    return { user: null, isAdmin: false };
  }
}

// Get provider verification statistics
export async function getVerificationStats(): Promise<{
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}> {
  try {
    const { data, error } = await supabase
      .from("service_providers")
      .select("verification_status");

    if (error) {
      console.error("Error fetching verification stats:", error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }

    const stats = (data || []).reduce(
      (acc: any, provider) => {
        acc[provider.verification_status]++;
        acc.total++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, total: 0 }
    );

    return stats;
  } catch (error) {
    console.error("Error in getVerificationStats:", error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}

// Bulk approve providers (for efficiency)
export async function bulkApproveProviders(
  providerIds: string[],
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_providers")
      .update({
        verification_status: "approved",
        admin_notes: "Bulk approved via admin dashboard",
        updated_at: new Date().toISOString(),
      })
      .in("id", providerIds);

    if (error) {
      console.error("Error bulk approving providers:", error);
      return false;
    }

    console.log(
      `${providerIds.length} providers bulk approved by admin ${adminId}`
    );
    return true;
  } catch (error) {
    console.error("Error in bulkApproveProviders:", error);
    return false;
  }
}
