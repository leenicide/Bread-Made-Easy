"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { adminService } from "@/lib/admin-service"
import type { Lead } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Mail, Edit } from "lucide-react"

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsData = await adminService.getLeads()
        setLeads(leadsData)
      } catch (error) {
        console.error("Failed to fetch leads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleStatusUpdate = async (id: string, status: Lead["status"], newNotes?: string) => {
    try {
      await adminService.updateLeadStatus(id, status, newNotes)
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status, notes: newNotes || lead.notes, updatedAt: new Date() } : lead,
        ),
      )
    } catch (error) {
      console.error("Failed to update lead status:", error)
    }
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setNotes(lead.notes || "")
  }

  const handleSaveNotes = async () => {
    if (!editingLead) return

    await handleStatusUpdate(editingLead.id, editingLead.status, notes)
    setEditingLead(null)
    setNotes("")
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage and track potential customers</p>
        </div>

        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{lead.name || "Anonymous"}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{lead.source}</Badge>
                      <Badge
                        variant={
                          lead.status === "new"
                            ? "destructive"
                            : lead.status === "contacted"
                              ? "default"
                              : lead.status === "qualified"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{formatDistanceToNow(lead.createdAt, { addSuffix: true })}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {lead.notes && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{lead.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Select
                    value={lead.status}
                    onValueChange={(value: Lead["status"]) => handleStatusUpdate(lead.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => handleEditLead(lead)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Lead Notes</DialogTitle>
                        <DialogDescription>Add or update notes for {lead.name || lead.email}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add notes about this lead..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingLead(null)} className="bg-transparent">
                            Cancel
                          </Button>
                          <Button onClick={handleSaveNotes}>Save Notes</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
