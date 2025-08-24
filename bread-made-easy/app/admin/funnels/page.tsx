// app/admin/funnels/page.tsx (updated Edit button)
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Image as ImageIcon, Edit, Trash2 } from "lucide-react"
import { funnelService } from "@/lib/funnel-service"
import type { Funnel } from "@/lib/types"

export default function FunnelManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    } else {
      loadFunnels()
    }
  }, [user, router])

  const loadFunnels = async () => {
    try {
      const funnelData = await funnelService.getFunnels()
      setFunnels(funnelData)
    } catch (error) {
      console.error("Error loading funnels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFunnel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this funnel?")) return
    
    try {
      const success = await funnelService.deleteFunnel(id)
      if (success) {
        alert("Funnel deleted successfully")
        loadFunnels() // Refresh the list
      } else {
        alert("Failed to delete funnel")
      }
    } catch (error) {
      console.error("Error deleting funnel:", error)
      alert("An error occurred while deleting the funnel")
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Loading...</div>
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading funnels...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Funnel Management</h1>
        <Link href="/admin/funnels/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Funnel
          </Button>
        </Link>
      </div>

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No funnels found. Create your first funnel to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funnels.map(funnel => (
            <Card key={funnel.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{funnel.title}</CardTitle>
                <CardDescription>ID: {funnel.funnel_id}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex space-x-4 mb-4">
                  {funnel.image_url ? (
                    <img 
                      src={funnel.image_url} 
                      alt={funnel.title} 
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {funnel.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(funnel.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0 border-t flex justify-between">
                <Link href={`/admin/funnels/edit/${funnel.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteFunnel(funnel.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}