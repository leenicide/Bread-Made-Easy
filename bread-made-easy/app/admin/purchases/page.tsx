// app/admin/purchases/page.tsx
"use client";

import { useEffect, useState } from "react";
import { purchaseService, PurchaseWithDetails } from "@/lib/purchase-service";
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
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  User
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

interface SortConfig {
  key: keyof PurchaseWithDetails;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const data = await purchaseService.getPurchases();
      setPurchases(data);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPurchases();
  };

  const handleSort = (key: keyof PurchaseWithDetails) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    exportToCSV(sortedPurchases, 'purchases-export.csv');
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const term = search.toLowerCase();
    const matchesSearch = (
      purchase.id.toLowerCase().includes(term) ||
      (purchase.stripe_payment_intent_id?.toLowerCase() || "").includes(term) ||
      (purchase.amount.toString().includes(term)) ||
      (purchase.buyer_id.toLowerCase().includes(term)) ||
      (purchase.buyer_name?.toLowerCase() || "").includes(term) ||
      (purchase.funnel_title?.toLowerCase() || "").includes(term)
    );

    const matchesStatus = statusFilter === 'all' || purchase.payment_status === statusFilter;
    const matchesType = typeFilter === 'all' || purchase.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedPurchases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPurchases = sortedPurchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const SortIcon = ({ columnKey }: { columnKey: keyof PurchaseWithDetails }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  // Status badge with icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Type badge with icon
  const getTypeBadge = (type: string) => {
    if (type === 'stripe') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Stripe
        </Badge>
      );
    } else if (type === 'paypal') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700">
          <CreditCard className="w-3 h-3" />
          PayPal
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          {type}
        </Badge>
      );
    }
  };

  // Note badge (auction vs buy_now)
  const getNoteBadge = (note: string) => {
    if (note === 'auction') {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          Auction Win
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
          Buy Now
        </Badge>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Purchases</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPurchases.length} purchases found
              {search && ` • ${filteredPurchases.length} matching search`}
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <span> • Filtered</span>
              )}
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
                  placeholder="Search by ID, amount, buyer, or funnel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 max-w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
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
        ) : filteredPurchases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">No purchases found</div>
              <p className="text-gray-500">
                {search || statusFilter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "No purchases have been made yet"
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
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Purchase ID
                          <SortIcon columnKey="id" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('note')}
                      >
                        <div className="flex items-center">
                          Type
                          <SortIcon columnKey="note" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          <SortIcon columnKey="amount" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('buyer_name')}
                      >
                        <div className="flex items-center">
                          Buyer
                          <SortIcon columnKey="buyer_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('payment_status')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon columnKey="payment_status" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center">
                          Payment Method
                          <SortIcon columnKey="type" />
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
                    {paginatedPurchases.map((purchase, index) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50">
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {purchase.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {getNoteBadge(purchase.note)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${purchase.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            {purchase.buyer_name || purchase.buyer_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.payment_status)}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(purchase.type)}
                        </TableCell>
                        <TableCell>
                          {purchase.created_at
                            ? new Date(purchase.created_at).toLocaleDateString()
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
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedPurchases.length)} of {sortedPurchases.length} purchases
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