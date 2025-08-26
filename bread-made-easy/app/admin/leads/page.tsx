"use client";

import { useEffect, useState } from "react";
import { leadSourceService } from "@/lib/lead-service"; // Update import
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
  User,
  FileText
} from "lucide-react";
import { LeadSource } from "@/lib/types"; // Update import
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
  key: keyof LeadSource;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await leadSourceService.getLeads();
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

  const handleSort = (key: keyof LeadSource) => {
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
      (lead.name?.toLowerCase() || "").includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.company?.toLowerCase() || "").includes(term) ||
      (lead.phone?.includes(term) ?? false) ||
      (lead.project_type?.toLowerCase() || "").includes(term)
    );

    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesSource;
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

  const SortIcon = ({ columnKey }: { columnKey: keyof LeadSource }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  // Source badge with icon
  const getSourceBadge = (source: 'custom_request' | 'bid_offer') => {
    if (source === 'custom_request') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Custom Request
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <User className="w-3 h-3" />
          Custom Offer
        </Badge>
      );
    }
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
              {sourceFilter !== 'all' && ` • Filtered by: ${sourceFilter === 'custom_request' ? 'Custom Requests' : 'Custom Offers'}`}
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
                  placeholder="Search by name, email, company, phone, or project type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 max-w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    <SelectItem value="custom_request">Custom Requests</SelectItem>
                    <SelectItem value="bid_offer">Custom Offers</SelectItem>
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
                {search || sourceFilter !== 'all'
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
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          <SortIcon columnKey="name" />
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
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Phone
                          <SortIcon columnKey="phone" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center">
                          Company
                          <SortIcon columnKey="company" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('source')}
                      >
                        <div className="flex items-center">
                          Source
                          <SortIcon columnKey="source" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('project_type')}
                      >
                        <div className="flex items-center">
                          Project/Offer
                          <SortIcon columnKey="project_type" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Date
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
                            {lead.name || "Unknown"}
                            {!lead.name && (
                              <Badge variant="outline" className="text-xs">Unknown</Badge>
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
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                              title="Call lead"
                            >
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.company || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>
                          {getSourceBadge(lead.source)}
                        </TableCell>
                        <TableCell>
                          {lead.source === 'custom_request' ? (
                            <div>
                              <div className="font-medium">{lead.project_type}</div>
                              {lead.budget && (
                                <div className="text-xs text-gray-500">Budget: {lead.budget}</div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">Custom Offer</div>
                              {lead.offer_amount && (
                                <div className="text-xs text-gray-500">Amount: ${lead.offer_amount}</div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleDateString()
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