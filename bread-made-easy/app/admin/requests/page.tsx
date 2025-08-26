'use client'

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Clock, Users, CheckCircle, Star, MessageSquare, Crown, Target, Scale, Gem, Calendar, ArrowRight, Hammer, Search, Eye, Trash2, Edit, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomRequestModal } from "@/components/custom-request/custom-request-modal"
import { useState, useEffect } from "react"
import Link from "next/link"
import { customRequestService } from "@/lib/custom-service"
import { CustomRequest } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function CustomRequestAdminPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await customRequestService.getCustomRequests()
      setRequests(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests")
      console.error("Error loading requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return
    
    try {
      await customRequestService.deleteCustomRequest(id)
      setRequests(requests.filter(request => request.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request")
      console.error("Error deleting request:", err)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const updatedRequest = await customRequestService.updateCustomRequestStatus(id, newStatus)
      setRequests(requests.map(request => 
        request.id === id ? updatedRequest : request
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
      console.error("Error updating status:", err)
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projecttype.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'reviewing': return 'outline'
      case 'approved': return 'default'
      case 'in_progress': return 'secondary'
      case 'completed': return 'default'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const exportToCSV = () => {
    const headers = [
      'ID', 'Name', 'Email', 'Company', 'Phone', 'Project Type', 
      'Industry', 'Target Audience', 'Primary Goal', 'Pages', 
      'Features', 'Timeline', 'Budget', 'Status', 'Submitted At', 'Quarter'
    ].join(',')
    
    const csvContent = filteredRequests.map(request => 
      [
        request.id,
        `"${request.name.replace(/"/g, '""')}"`,
        request.email,
        request.company ? `"${request.company.replace(/"/g, '""')}"` : '',
        request.phone || '',
        request.projecttype,
        request.industry,
        request.targetaudience ? `"${request.targetaudience.replace(/"/g, '""')}"` : '',
        request.primarygoal,
        `"${request.pages.join('; ')}"`,
        `"${request.features.join('; ')}"`,
        request.timeline || '',
        request.budget || '',
        request.status,
        format(new Date(request.submitted_at), 'yyyy-MM-dd HH:mm'),
        request.quarter || ''
      ].join(',')
    ).join('\n')
    
    const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `custom-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <p>Loading requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
    
    <div className="min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Custom Requests Admin</h1>
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, company, or project type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Custom Requests ({filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Project Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No custom requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{request.company || '-'}</TableCell>
                        <TableCell>{request.projecttype}</TableCell>
                        <TableCell>{request.budget || '-'}</TableCell>
                        <TableCell>
                          <Select 
                            value={request.status} 
                            onValueChange={(value) => handleStatusUpdate(request.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge variant={getStatusBadgeVariant(request.status)}>
                                  {request.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.submitted_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/requests/${request.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </AdminLayout>
  )
}