// app/admin/custom-requests/[id]/page.tsx
'use client'

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { customRequestService } from "@/lib/custom-service"
import { CustomRequest } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Mail, Phone, Building, Calendar, Target, Users, Clock, DollarSign } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function CustomRequestDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [request, setRequest] = useState<CustomRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRequest()
  }, [id])

  const loadRequest = async () => {
    try {
      setLoading(true)
      const requests = await customRequestService.getCustomRequests()
      const foundRequest = requests.find(r => r.id === id)
      
      if (!foundRequest) {
        throw new Error("Request not found")
      }
      
      setRequest(foundRequest)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request")
      console.error("Error loading request:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!request) return
    
    try {
      const updatedRequest = await customRequestService.updateCustomRequestStatus(request.id, newStatus)
      setRequest(updatedRequest)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
      console.error("Error updating status:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <p>Loading request...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">{error || "Request not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
    <div className="min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" asChild className="mb-6">
            <Link href="/admin/requests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Link>
          </Button>

          <div className="grid gap-6">
            {/* Header Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl">{request.name}</CardTitle>
                <Select value={request.status} onValueChange={handleStatusUpdate}>
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'outline'
                      }>
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{request.email}</span>
                  </div>
                  {request.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{request.phone}</span>
                    </div>
                  )}
                  {request.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{request.company}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(new Date(request.submitted_at), 'PPP')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Project Type</h3>
                    <p>{request.projecttype}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Industry</h3>
                    <p>{request.industry}</p>
                  </div>
                </div>
                
                {request.targetaudience && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Target Audience
                    </h3>
                    <p>{request.targetaudience}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Primary Goal
                  </h3>
                  <p>{request.primarygoal}</p>
                </div>
                
                {request.timeline && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline
                    </h3>
                    <p>{request.timeline}</p>
                  </div>
                )}
                
                {request.budget && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Budget
                    </h3>
                    <p>{request.budget}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pages & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requested Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  {request.pages && request.pages.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {request.pages.map((page, index) => (
                        <li key={index}>{page}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No pages specified</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requested Features</CardTitle>
                </CardHeader>
                <CardContent>
                  {request.features && request.features.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {request.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No features specified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            {(request.inspiration || request.additionalnotes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.inspiration && (
                    <div>
                      <h3 className="font-semibold mb-2">Inspiration/Examples</h3>
                      <p className="whitespace-pre-wrap">{request.inspiration}</p>
                    </div>
                  )}
                  
                  {request.additionalnotes && (
                    <div>
                      <h3 className="font-semibold mb-2">Additional Notes</h3>
                      <p className="whitespace-pre-wrap">{request.additionalnotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
        </AdminLayout>

  )
}