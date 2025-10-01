// app/admin/strategy-calls/page.tsx
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Mail, Phone, User, Building, Download, RefreshCw } from "lucide-react"
import { strategyCallService, type StrategyCallBooking } from "@/lib/call-service"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function StrategyCallBookingsAdmin() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<StrategyCallBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    } else {
      loadBookings()
    }
  }, [user, router])

  const loadBookings = async () => {
    try {
      const bookingData = await strategyCallService.getAllBookings()
      setBookings(bookingData)
    } catch (error) {
      console.error("Error loading strategy call bookings:", error)
      alert("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    setExporting(true)
    try {
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Preferred Date', 'Preferred Time', 'Timezone', 'Created At']
      const csvData = bookings.map(booking => [
        booking.name,
        booking.email,
        booking.phone_number || 'N/A',
        booking.company || 'N/A',
        new Date(booking.preferred_date).toLocaleDateString(),
        booking.preferred_time_slot,
        booking.timezone,
        new Date(booking.created_at).toLocaleString()
      ])

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `strategy-call-bookings-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("Failed to export data")
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || user.role !== 'admin') {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading strategy call bookings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Strategy Call Bookings</h1>
            <p className="text-muted-foreground mt-2">
              Manage and view all strategy call requests from potential clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadBookings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportToCSV}
              disabled={exporting || bookings.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(booking => 
                      new Date(booking.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(booking => {
                      const bookingDate = new Date(booking.created_at)
                      const oneWeekAgo = new Date()
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                      return bookingDate >= oneWeekAgo
                    }).length}
                  </p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(booking => {
                      const bookingDate = new Date(booking.created_at)
                      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                      return bookingDate >= firstDayOfMonth
                    }).length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Strategy Call Bookings</h3>
              <p className="text-muted-foreground">
                No strategy call requests have been submitted yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {booking.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {booking.email}
                            </div>
                            {booking.phone_number && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {booking.phone_number}
                              </div>
                            )}
                            {booking.company && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Building className="h-3 w-3" />
                                {booking.company}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          New
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Preferred Date:</span>
                          <span>{formatDate(booking.preferred_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Preferred Time:</span>
                          <span>{booking.preferred_time_slot} ({booking.timezone})</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Metadata */}
                    <div className="flex flex-col gap-2 lg:text-right">
                      <div className="text-sm text-muted-foreground">
                        Submitted: {formatDateTime(booking.created_at)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`mailto:${booking.email}?subject=Strategy Call Confirmation&body=Hi ${booking.name},`}>
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </a>
                        </Button>
                        {booking.phone_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={`tel:${booking.phone_number}`}>
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {bookings.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Overview of strategy call booking activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Recent Activity</h4>
                  <ul className="space-y-1">
                    {bookings.slice(0, 5).map(booking => (
                      <li key={booking.id} className="flex justify-between">
                        <span>{booking.name}</span>
                        <span className="text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                      <a href={`mailto:${bookings.map(b => b.email).join(',')}?subject=Strategy Call Update`}>
                        <Mail className="h-3 w-3 mr-2" />
                        Email All Contacts
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={exportToCSV}>
                      <Download className="h-3 w-3 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}