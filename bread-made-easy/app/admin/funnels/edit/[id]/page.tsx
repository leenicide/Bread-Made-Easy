// app/admin/funnels/edit/[id]/page.tsx
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Upload, Image as ImageIcon, ArrowLeft, Plus, X } from "lucide-react"
import { funnelService } from "@/lib/funnel-service"
import Link from "next/link"
import type { Funnel, Category } from "@/lib/types"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function EditFunnel() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const funnelId = params.id as string

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [funnel, setFunnel] = useState<Funnel | null>(null)
    const [funnelName, setFunnelName] = useState("")
    const [funnelDescription, setFunnelDescription] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
    const [newCategoryName, setNewCategoryName] = useState("")
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [isAvailableForLease, setIsAvailableForLease] = useState(false)


    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            router.push('/dashboard')
        } else {
            loadFunnel()
            loadCategories()
        }
    }, [user, router, funnelId])

    const loadFunnel = async () => {
        try {
            const funnelData = await funnelService.getFunnelByIdWithCategory(funnelId)
            if (funnelData) {
                setFunnel(funnelData)
                setFunnelName(funnelData.title)
                setFunnelDescription(funnelData.description || "")
                setImagePreview(funnelData.image_url)
                setSelectedCategoryId(funnelData.category_id || "")
                setIsAvailableForLease(funnelData.is_available_for_lease || false)

            }
        } catch (error) {
            console.error("Error loading funnel:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadCategories = async () => {
        try {
            const categoryData = await funnelService.getCategories()
            setCategories(categoryData)
        } catch (error) {
            console.error("Error loading categories:", error)
        } finally {
            setLoadingCategories(false)
        }
    }

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

    const handleAddNewCategory = async () => {
        if (!newCategoryName.trim()) {
            alert("Please enter a category name")
            return
        }

        try {
            const newCategory = await funnelService.createCategory(newCategoryName.trim())
            if (newCategory) {
                setCategories([...categories, newCategory])
                setSelectedCategoryId(newCategory.id)
                setNewCategoryName("")
                setShowNewCategory(false)
            } else {
                alert("Failed to create category")
            }
        } catch (error) {
            console.error("Error creating category:", error)
            alert("An error occurred while creating the category")
        }
    }

    const saveFunnel = async () => {
        if (!funnelName.trim()) {
            alert("Please enter a funnel name")
            return
        }

        if (!funnel) return

        setIsSaving(true)

        try {
            let imageUrl = funnel.image_url

            // Upload new image if selected
            if (imageFile) {
                imageUrl = await funnelService.uploadFunnelImage(imageFile)
                if (!imageUrl) {
                    alert("Failed to upload image")
                    setIsSaving(false)
                    return
                }
            }

            // Update funnel in database
            // Update funnel in database
            const updates = {
                title: funnelName,
                description: funnelDescription || undefined, // Convert empty string to undefined
                image_url: imageUrl || undefined, // Convert null to undefined
                category_id: selectedCategoryId || undefined, // Convert empty string to undefined
                is_available_for_lease: isAvailableForLease

            }

            const updatedFunnel = await funnelService.updateFunnel(funnel.id, updates)

            if (updatedFunnel) {
                alert("Funnel updated successfully!")
                router.push("/admin/funnels")
            } else {
                alert("Failed to update funnel")
            }
        } catch (error) {
            console.error("Error updating funnel:", error)
            alert("An error occurred while updating the funnel")
        } finally {
            setIsSaving(false)
        }
    }

    if (!user || user.role !== 'admin') {
        return <div>Loading...</div>
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto p-6">Loading funnel...</div>
            </AdminLayout>
        )
    }

    if (!funnel) {
        return (
            <AdminLayout>
                <div className="container mx-auto p-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Funnel Not Found</h1>
                        <Link href="/admin/funnels">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Funnels
                            </Button>
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6">
                    <Link href="/admin/funnels" className="mr-4">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Funnel</h1>
                    <div className="ml-auto">
                        <Button onClick={saveFunnel} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Funnel Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Funnel Details</CardTitle>
                            <CardDescription>
                                Update your product/offering information
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

                            <div className="space-y-2">
                                <Label>Category</Label>
                                {loadingCategories ? (
                                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                                ) : (
                                    <>
                                        <select
                                            value={selectedCategoryId}
                                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="">No category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>

                                        {!showNewCategory ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCategory(true)}
                                                className="text-sm text-blue-600 hover:underline mt-1 flex items-center"
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add new category
                                            </button>
                                        ) : (
                                            <div className="mt-2 space-y-2">
                                                <div className="flex space-x-2">
                                                    <Input
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        placeholder="Enter new category name"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddNewCategory}
                                                        size="sm"
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setShowNewCategory(false)}
                                                        size="sm"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                              {/* Add Lease Availability Toggle */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lease-available"
                    checked={isAvailableForLease}
                    onChange={(e) => setIsAvailableForLease(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="lease-available" className="text-sm font-medium">
                    Available for Lease
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, this funnel can be leased by users through lease requests
                </p>
              </div>

                            <div className="space-y-2">
                                <Label>Funnel ID</Label>
                                <Input
                                    value={funnel.funnel_id}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This ID is automatically generated and cannot be changed.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Image Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Image</CardTitle>
                            <CardDescription>
                                Update the image that represents this offering
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

                {/* Funnel Metadata */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Funnel Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Created:</span>{' '}
                                {new Date(funnel.created_at).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span>{' '}
                                {new Date(funnel.updated_at).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>{' '}
                                <span className={`px-2 py-1 rounded-full text-xs ${funnel.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {funnel.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">Database ID:</span>{' '}
                                <code className="text-xs bg-muted p-1 rounded">{funnel.id}</code>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}