"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Download,
  RefreshCw,
  Search,
  Filter,
  Building,
  Calendar,
  Target,
  Goal,
  FileText
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/lib/utils";
import { leasingService } from "@/lib/leasing-service";
import type { LeaseRequest } from "@/lib/types";

interface SortConfig {
  key: keyof LeaseRequest;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

export default function LeaseRequestsPage() {
  const [requests, setRequests] = useState<LeaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaseTypeFilter, setLeaseTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaseRequests();
  }, []);

  const fetchLeaseRequests = async () => {
    try {
      const data = await leasingService.getLeaseRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch lease requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaseRequests();
  };

  const handleSort = (key: keyof LeaseRequest) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    exportToCSV(sortedRequests, 'lease-requests-export.csv');
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await leasingService.updateLeaseRequestStatus(id, newStatus);
      // Refresh the data to show updated status
      fetchLeaseRequests();
    } catch (err) {
      console.error("Failed to update lease request status:", err);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const term = search.toLowerCase();
    const matchesSearch = (
      request.name.toLowerCase().includes(term) ||
      request.email.toLowerCase().includes(term) ||
      (request.company?.toLowerCase() || "").includes(term) ||
      (request.phone?.includes(term) ?? false) ||
      request.project_type.toLowerCase().includes(term) ||
      request.industry.toLowerCase().includes(term)
    );

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesLeaseType = leaseTypeFilter === 'all' || request.lease_type === leaseTypeFilter;

    return matchesSearch && matchesStatus && matchesLeaseType;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const SortIcon = ({ columnKey }: { columnKey: keyof LeaseRequest }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      reviewing: { variant: "secondary" as const, label: "Reviewing" },
      approved: { variant: "default" as const, label: "Approved" },
      rejected: { variant: "destructive" as const, label: "Rejected" },
      completed: { variant: "default" as const, label: "Completed" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getLeaseTypeBadge = (leaseType: string) => {
    if (leaseType === 'performance_based') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          Performance Based
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Fixed Term
        </Badge>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Lease Requests</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredRequests.length} requests found
              {search && ` • ${filteredRequests.length} matching search`}
              {(statusFilter !== 'all' || leaseTypeFilter !== 'all') && 
                ` • Filtered by: ${statusFilter !== 'all' ? statusFilter : ''} ${leaseTypeFilter !== 'all' ? leaseTypeFilter : ''}`
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, company, phone, project type, or industry..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 max-w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={leaseTypeFilter} onValueChange={setLeaseTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Building className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="performance_based">Performance Based</SelectItem>
                    <SelectItem value="fixed_term">Fixed Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">No lease requests found</div>
              <p className="text-gray-500">
                {search || statusFilter !== 'all' || leaseTypeFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "No lease requests have been submitted yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        #
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Contact
                          <SortIcon columnKey="name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('project_type')}
                      >
                        <div className="flex items-center">
                          Project
                          <SortIcon columnKey="project_type" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('industry')}
                      >
                        <div className="flex items-center">
                          Industry
                          <SortIcon columnKey="industry" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('lease_type')}
                      >
                        <div className="flex items-center">
                          Lease Type
                          <SortIcon columnKey="lease_type" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('estimated_revenue')}
                      >
                        <div className="flex items-center">
                          Est. Revenue
                          <SortIcon columnKey="estimated_revenue" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon columnKey="status" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Submitted
                          <SortIcon columnKey="created_at" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((request, index) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.name}</div>
                            <div className="flex flex-col text-sm text-gray-500">
                              <a
                                href={`mailto:${request.email}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                title="Send email"
                              >
                                {request.email}
                              </a>
                              {request.phone && (
                                <a
                                  href={`tel:${request.phone}`}
                                  className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                                  title="Call contact"
                                >
                                  {request.phone}
                                </a>
                              )}
                            </div>
                            {request.company && (
                              <div className="text-sm flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {request.company}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{request.project_type}</div>
                            {request.primary_goal && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Goal className="w-3 h-3" />
                                {request.primary_goal}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.industry}
                        </TableCell>
                        <TableCell>
                          {getLeaseTypeBadge(request.lease_type)}
                        </TableCell>
                        <TableCell>
                          {request.estimated_revenue ? (
                            <div className="font-medium">
                              ${request.estimated_revenue.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(request.status)}
                            {request.assigned_team_member && (
                              <div className="text-xs text-gray-500">
                                {request.assigned_team_member}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>
                              {request.created_at
                                ? new Date(request.created_at).toLocaleDateString()
                                : "-"}
                            </div>
                            {request.quarter && (
                              <div className="text-xs text-gray-500">
                                {request.quarter}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedRequests.length)} of {sortedRequests.length} requests
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="px-2">...</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}