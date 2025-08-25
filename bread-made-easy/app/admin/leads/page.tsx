"use client";

import { useEffect, useState } from "react";
import { leadService } from "@/lib/lead-service";
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
  Filter
} from "lucide-react";
import { Lead } from "@/lib/types";
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

interface SortConfig {
  key: keyof Lead;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await leadService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleSort = (key: keyof Lead) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    exportToCSV(sortedLeads, 'leads-export.csv');
  };

  const filteredLeads = leads.filter((lead) => {
    const term = search.toLowerCase();
    const matchesSearch = (
      (lead.username?.toLowerCase() || "").includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.phone_number?.includes(term) ?? false)
    );

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'with_phone' && lead.phone_number) ||
      (statusFilter === 'without_phone' && !lead.phone_number);

    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
    if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;

    if (a[sortConfig.key]! < b[sortConfig.key]!) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key]! > b[sortConfig.key]!) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const SortIcon = ({ columnKey }: { columnKey: keyof Lead }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredLeads.length} leads found
              {search && ` • ${filteredLeads.length} matching search`}
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
                  placeholder="Search by name, email, or phone..."
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
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value="with_phone">With Phone</SelectItem>
                    <SelectItem value="without_phone">Without Phone</SelectItem>
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
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">No leads found</div>
              <p className="text-gray-500">
                {search || statusFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "No leads have been collected yet"
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
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center">
                          Name
                          <SortIcon columnKey="username" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          <SortIcon columnKey="email" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('phone_number')}
                      >
                        <div className="flex items-center">
                          Phone
                          <SortIcon columnKey="phone_number" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Created At
                          <SortIcon columnKey="created_at" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeads.map((lead, index) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lead.username || "Anonymous"}
                            {!lead.username && (
                              <Badge variant="outline" className="text-xs">Anonymous</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              title="Send email"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.phone_number ? (
                            <a
                              href={`tel:${lead.phone_number}`}
                              className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                              title="Call lead"
                            >
                              {lead.phone_number}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleString()
                            : "-"}
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
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedLeads.length)} of {sortedLeads.length} leads
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