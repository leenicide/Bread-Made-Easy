// app/admin/funnels/create/page.tsx
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Upload, Image as ImageIcon } from "lucide-react"
import { funnelService } from "@/lib/funnel-service"

export default function CreateFunnel() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [funnelName, setFunnelName] = useState("")
  const [funnelDescription, setFunnelDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const saveFunnel = async () => {
    if (!funnelName.trim()) {
      alert("Please enter a funnel name")
      return
    }

    setIsSaving(true)

    try {
      let imageUrl = null
      
      // Upload image if selected
      if (imageFile) {
        imageUrl = await funnelService.uploadFunnelImage(imageFile)
        if (!imageUrl) {
          alert("Failed to upload image")
          setIsSaving(false)
          return
        }
      }

      // Create funnel in database
      const funnelData = {
        title: funnelName,
        description: funnelDescription,
        image_url: imageUrl
      }

      const newFunnel = await funnelService.createFunnel(funnelData)
      
      if (newFunnel) {
        alert("Funnel created successfully!")
        router.push("/admin/funnels")
      } else {
        alert("Failed to create funnel")
      }
    } catch (error) {
      console.error("Error saving funnel:", error)
      alert("An error occurred while saving the funnel")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Funnel</h1>
        <Button onClick={saveFunnel} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" /> 
          {isSaving ? "Saving..." : "Save Funnel"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Funnel Details</CardTitle>
            <CardDescription>
              Create a new product/offering that can be used in auctions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="funnel-name">Funnel Name *</Label>
              <Input
                id="funnel-name"
                value={funnelName}
                onChange={(e) => setFunnelName(e.target.value)}
                placeholder="e.g., Artisan Bread Making Masterclass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="funnel-description">Description</Label>
              <textarea
                id="funnel-description"
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={funnelDescription}
                onChange={(e) => setFunnelDescription(e.target.value)}
                placeholder="Describe this product or offering..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>
              Add an image that represents this offering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div 
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-accent"
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-48 object-contain"
                    />
                    <p className="text-sm mt-2">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-sm">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800">About Funnels</h3>
          <p className="text-sm text-blue-600 mt-1">
            Funnels represent products or offerings that can be auctioned. Each funnel 
            creates a unique identifier that can be used to track auctions and purchases 
            for this specific offering.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}