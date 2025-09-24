"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { leasingService } from "@/lib/leasing-service"
import { useAuth } from "@/contexts/auth-context"
import type { LeaseRequest } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import {
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Zap,
  Shield
} from "lucide-react"

interface LeasingTrackerProps {
  userId: string
}

export function LeasingTracker({ userId }: LeasingTrackerProps) {
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLeaseRequests = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const requestsData = await leasingService.getLeaseRequestsByEmail(user.email)
        setLeaseRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch lease requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaseRequests()
  }, [userId, user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "active":
        return <Zap className="h-4 w-4 text-green-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 10
      case "under_review":
        return 30
      case "approved":
        return 60
      case "active":
        return 80
      case "completed":
        return 100
      case "rejected":
      case "cancelled":
        return 0
      default:
        return 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const mapRequestToComponent = (request: LeaseRequest) => ({
    ...request,
    title: request.project_type || "Lease Request",
    description:
      request.primary_goal || request.additional_notes || "No description provided"
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (leaseRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Lease Requests</h3>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any Wealth Oven lease requests yet.
          </p>
          <Button asChild>
            <a href="/leasing">Submit a Lease Request</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {leaseRequests.map((request) => {
        const mappedRequest = mapRequestToComponent(request)

        return (
          <Card key={request.id} className="relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(request.status).split(" ")[0]}`}
            ></div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {mappedRequest.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {mappedRequest.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <Badge
                    variant={
                      request.status === "active" || request.status === "completed"
                        ? "default"
                        : request.status === "approved"
                        ? "secondary"
                        : request.status === "rejected" || request.status === "cancelled"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Lease Progress</span>
                  <span>{getStatusProgress(request.status)}%</span>
                </div>
                <Progress value={getStatusProgress(request.status)} className="h-2" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Type</p>
                    <p className="font-semibold capitalize">
                      {request.lease_type || "Performance-Based"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Project Type</p>
                    <p className="font-semibold capitalize">
                      {request.project_type?.replace("-", " ") || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold">
                      {formatDistanceToNow(request.submitted_at, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {request.estimated_revenue && (
                <div className="bg-primary/5 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Estimated Monthly Revenue:</span>
                    <span className="font-bold text-primary">
                      ${request.estimated_revenue}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Request ID: {request.id}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Team
                  </Button>
                  {(request.status === "active" || request.status === "completed") && (
                    <Button size="sm">View Lease Details</Button>
                  )}
                  {request.status === "approved" && (
                    <Button size="sm">Start Lease</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
