"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { customRequestService } from "@/lib/custom-service"
import { useAuth } from "@/contexts/auth-context"
import type { CustomRequest } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Clock, MessageSquare, CheckCircle, AlertCircle, Calendar, DollarSign } from "lucide-react"

interface RequestTrackerProps {
  userId: string
}

export function RequestTracker({ userId }: RequestTrackerProps) {
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }
      
      try {
        // Fetch requests by user email
        const requestsData = await customRequestService.getCustomRequestsByEmail(user.email)
        setRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [userId, user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "reviewing":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 10
      case "reviewing":
        return 25
      case "approved":
        return 50
      case "in_progress":
        return 75
      case "completed":
        return 100
      case "rejected":
        return 0
      default:
        return 0
    }
  }

  // Helper function to map database fields to component expectations
  const mapRequestToComponent = (request: CustomRequest) => {
    return {
      ...request,
      // Map database fields to what your component expects
      title: request.projecttype || "Custom Request",
      description: request.primarygoal || request.additionalnotes || "No description provided",
      budget: request.budget ? parseFloat(request.budget) : 0,
      // Add any other mappings needed
    }
  }

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

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Custom Requests</h3>
          <p className="text-muted-foreground mb-4">You haven't submitted any custom funnel requests yet.</p>
          <Button asChild>
            <a href="/custom-request">Submit a Request</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => {
        const mappedRequest = mapRequestToComponent(request)
        
        return (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{mappedRequest.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{mappedRequest.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <Badge
                    variant={
                      request.status === "completed"
                        ? "default"
                        : request.status === "in_progress"
                          ? "secondary"
                          : request.status === "cancelled"
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
                  <span>Progress</span>
                  <span>{getStatusProgress(request.status)}%</span>
                </div>
                <Progress value={getStatusProgress(request.status)} className="h-2" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold">${mappedRequest.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">
                      {request.timeline || "Flexible"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold">{formatDistanceToNow(request.submitted_at, { addSuffix: true })}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Request ID: {request.id}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Team
                  </Button>
                  {request.status === "completed" && <Button size="sm">Download Files</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}