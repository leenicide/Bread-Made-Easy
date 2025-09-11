"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Gavel, 
  Users, 
  FileText, 
  DollarSign, 
  Settings,
  LogOut,
  User as UserIcon, // ← Rename the icon import
  Shield
} from "lucide-react"
import { authService } from "@/lib/auth"
import type { User } from "@/lib/types" // ← This stays as User type
import Image from "next/image"

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      permission: "canAccessAdminPanel"
    },
    {
      name: "Auctions",
      href: "/admin/auctions",
      icon: Gavel,
      permission: "canViewAllAuctions"
    },
     {
      name: "Funnels",
      href: "/admin/funnels",
      icon: Gavel,
      permission: "canViewAllFunnels"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      permission: "canViewAllUsers"
    },
    {
      name: "Leads",
      href: "/admin/leads",
      icon: FileText,
      permission: "canViewAllLeads"
    },
    {
      name: "Custom Requests",
      href: "/admin/requests",
      icon: FileText,
      permission: "canViewAllCustomRequests"
    },
    {
      name: "Purchases",
      href: "/admin/purchases",
      icon: DollarSign,
      permission: "canViewAllPurchases"
    },
    // {
    //   name: "Analytics",
    //   href: "/admin/analytics",
    //   icon: LayoutDashboard,
    //   permission: "canViewAnalytics"
    // },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      permission: "canAccessAdminPanel"
    },
  ]

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/login'
  }

  const filteredNavigation = navigation.filter(item => 
    authService.hasPermission(user, item.permission as any)
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-15 h-15 rounded-lg flex items-center justify-center">
            <Image src="/icon-logo.png" alt="Path Logo" width={300} height={300} className="ml-2"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Bread Made Easy</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" /> {/* ← Use the renamed icon */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.display_name || user.email}
              </p>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
  
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}