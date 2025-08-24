"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type Role } from '@/lib/auth'
import type { User } from '@/lib/types'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
  requiredPermission?: string
  fallback?: React.ReactNode
  redirectTo?: string
  showUnauthorizedMessage?: boolean
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  redirectTo = '/login',
  showUnauthorizedMessage = true,
}: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)

        if (!currentUser) {
          setHasAccess(false)
          setLoading(false)
          if (redirectTo) {
            router.push(redirectTo)
          }
          return
        }

        // Check role-based access
        if (requiredRole) {
          const roleAccess = authService.hasRole(currentUser, requiredRole)
          if (!roleAccess) {
            setHasAccess(false)
            setLoading(false)
            return
          }
        }

        // Check permission-based access
        if (requiredPermission) {
          const permissionAccess = authService.hasPermission(currentUser, requiredPermission as any)
          if (!permissionAccess) {
            setHasAccess(false)
            setLoading(false)
            return
          }
        }

        setHasAccess(true)
      } catch (error) {
        console.error('Error checking access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [requiredRole, requiredPermission, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (!showUnauthorizedMessage) {
      return null
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="text-sm text-gray-600">
                <p>Current role: <span className="font-medium">{user.role}</span></p>
                {requiredRole && (
                  <p>Required role: <span className="font-medium">
                    {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
                  </span></p>
                )}
                {requiredPermission && (
                  <p>Required permission: <span className="font-medium">{requiredPermission}</span></p>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p>You need to be logged in to access this page.</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                Go Back
              </Button>
              {!user && (
                <Button 
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  Login
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for common role checks
export function AdminOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="admin" {...props}>
      {children}
    </RoleGuard>
  )
}

export function UserOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="user" {...props}>
      {children}
    </RoleGuard>
  )
}

export function AuthenticatedOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole={['user', 'admin']} {...props}>
      {children}
    </RoleGuard>
  )
}

// Permission-based guards
export function CanViewAdminPanel({ children, ...props }: Omit<RoleGuardProps, 'requiredPermission'>) {
  return (
    <RoleGuard requiredPermission="canAccessAdminPanel" {...props}>
      {children}
    </RoleGuard>
  )
}

export function CanManageUsers({ children, ...props }: Omit<RoleGuardProps, 'requiredPermission'>) {
  return (
    <RoleGuard requiredPermission="canViewAllUsers" {...props}>
      {children}
    </RoleGuard>
  )
}

export function CanViewAnalytics({ children, ...props }: Omit<RoleGuardProps, 'requiredPermission'>) {
  return (
    <RoleGuard requiredPermission="canViewAnalytics" {...props}>
      {children}
    </RoleGuard>
  )
}
