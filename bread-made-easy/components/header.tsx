// components/header.tsx (updated)
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Menu, Crown } from "lucide-react"
import { useState } from "react"
import { CustomRequestModal } from "@/components/custom-request/custom-request-modal"

// Define user path types
type UserPath = 'leasing' | 'auction' | 'custom';

export function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [customRequestOpen, setCustomRequestOpen] = useState(false)
  
  // Determine user path - in a real app, this would come from user preferences or context
  // For now, we'll use a default of 'auction' or check for a stored preference
  const [userPath, setUserPath] = useState<UserPath>(
    () => {
      if (typeof window !== 'undefined') {
        return (localStorage.getItem('userPath') as UserPath) || 'auction';
      }
      return 'auction';
    }
  );

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 mx-auto">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo - left aligned with specific spacing */}
          <Link href="/" className="flex items-center gap-2 md:ml-4 lg:ml-6">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">Bread Made Easy</span>
          </Link>

          {/* Centered navigation for desktop - Empty for now */}
          <nav className="hidden md:flex items-center gap-8 mx-8">
            {/* Empty for now, can add other navigation items here if needed */}
          </nav>

          {/* Right side with Custom Build button and Auth buttons */}
          <div className="flex items-center gap-2 md:gap-4 md:mr-4 lg:mr-6">
            {/* Custom Build Button */}
            <Button
              variant="default"
              className="flex items-center gap-1 hidden md:flex"
              onClick={() => setCustomRequestOpen(true)}
            >
              <Crown className="h-4 w-4" />
              Request a Custom Build
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container px-4 py-4 flex flex-col gap-4">
              <Button
                variant="default"
                className="flex items-center gap-1 justify-start"
                onClick={() => {
                  setCustomRequestOpen(true)
                  setMobileMenuOpen(false)
                }}
              >
                <Crown className="h-4 w-4" />
                Request a Custom Build
              </Button>
              
              {!user && (
                <div className="flex flex-col gap-2 pt-4 border-t mt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <CustomRequestModal open={customRequestOpen} onOpenChange={setCustomRequestOpen} />
    </>
  )
}