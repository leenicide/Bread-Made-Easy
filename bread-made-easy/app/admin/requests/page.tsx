"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminService } from "@/lib/admin-service"
import type { CustomRequest } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, DollarSign, Calendar, User } from "lucide-react"

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsData = await adminService.getCustomRequests()
        setRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleStatusUpdate = async (id: string, status: CustomRequest["status"]) => {
    try {
      await adminService.updateCustomRequestStatus(id, status)
      setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status, updatedAt: new Date() } : req)))
    } catch (error) {
      console.error("Failed to update request status:", error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Requests</h1>
          <p className="text-muted-foreground">Manage client project requests and proposals</p>
        </div>

        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      request.status === "open"
                        ? "destructive"
                        : request.status === "in_progress"
                          ? "default"
                          : request.status === "completed"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">${request.budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-semibold">{request.buyerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">
                        {request.deadline ? request.deadline.toLocaleDateString() : "Flexible"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-semibold">{formatDistanceToNow(request.createdAt, { addSuffix: true })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={request.status}
                    onValueChange={(value: CustomRequest["status"]) => handleStatusUpdate(request.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-transparent">
                    Contact Client
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Create Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
