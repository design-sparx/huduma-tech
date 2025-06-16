"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/contexts/AuthContext";
import {
  type AdminStats,
  approveProvider,
  getAdminStats,
  getPendingProviders,
  getPendingReports,
  type PendingProvider,
  type PendingReport,
  rejectProvider,
  resolveReport,
} from "@/lib/services/admin";

export default function AdminDashboard() {
  const { canAccessAdmin, loading } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>(
    []
  );
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !canAccessAdmin) {
      redirect("/");
    }
  }, [loading, canAccessAdmin]);

  // Load admin data
  useEffect(() => {
    if (canAccessAdmin) {
      loadAdminData();
    }
  }, [canAccessAdmin]);

  const loadAdminData = async () => {
    try {
      setLoadingData(true);
      const [statsData, providersData, reportsData] = await Promise.all([
        getAdminStats(),
        getPendingProviders(),
        getPendingReports(),
      ]);

      setStats(statsData);
      setPendingProviders(providersData);
      setPendingReports(reportsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    try {
      setProcessingAction(providerId);
      const success = await approveProvider(
        providerId,
        "admin",
        "Approved via admin dashboard"
      );

      if (success) {
        // Remove from pending list
        setPendingProviders(prev => prev.filter(p => p.id !== providerId));
        // Refresh stats
        const newStats = await getAdminStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error approving provider:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    try {
      setProcessingAction(providerId);
      const success = await rejectProvider(
        providerId,
        "admin",
        "Profile incomplete or requirements not met"
      );

      if (success) {
        // Remove from pending list
        setPendingProviders(prev => prev.filter(p => p.id !== providerId));
        // Refresh stats
        const newStats = await getAdminStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error rejecting provider:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      setProcessingAction(reportId);
      const success = await resolveReport(
        reportId,
        "admin",
        "Resolved via admin dashboard"
      );

      if (success) {
        // Remove from pending list
        setPendingReports(prev => prev.filter(r => r.id !== reportId));
        // Refresh stats
        const newStats = await getAdminStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error("Error resolving report:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 animate-spin" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!canAccessAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your HudumaTech platform
          </p>
        </div>
        <Button onClick={loadAdminData} disabled={loadingData}>
          {loadingData ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Providers
              </CardTitle>
              <UserCheck className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProviders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verifications
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingVerifications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reports
              </CardTitle>
              <AlertTriangle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.pendingReports}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Requests
              </CardTitle>
              <MessageSquare className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Jobs
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedRequests}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Provider Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Provider Verifications</CardTitle>
          <CardDescription>
            Review and approve service provider applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProviders.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No pending verifications
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProviders.map(provider => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.name}
                    </TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {provider.services.slice(0, 2).map((service: any) => (
                          <Badge
                            key={service}
                            variant="outline"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                        {provider.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.services.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{provider.location}</TableCell>
                    <TableCell>
                      {formatCurrency(provider.hourlyRate)}/hr
                    </TableCell>
                    <TableCell>{provider.experienceYears} years</TableCell>
                    <TableCell>
                      {new Date(provider.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveProvider(provider.id)}
                          disabled={processingAction === provider.id}
                        >
                          {processingAction === provider.id ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectProvider(provider.id)}
                          disabled={processingAction === provider.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reports</CardTitle>
          <CardDescription>
            Review user reports and take appropriate action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">
              No pending reports
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>{report.reporterName}</TableCell>
                    <TableCell>{report.reportedName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.reportType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.description}
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleResolveReport(report.id)}
                        disabled={processingAction === report.id}
                      >
                        {processingAction === report.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : null}
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="mb-2 h-6 w-6" />
              View All Users
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <UserCheck className="mb-2 h-6 w-6" />
              Manage Providers
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="mb-2 h-6 w-6" />
              View Requests
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="mb-2 h-6 w-6" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
