"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { FileText, Building2, Send, User as UserIcon, LogOut, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: User
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/agencies", label: "Agencies", icon: Building2 },
  { href: "/dashboard/requests", label: "My Requests", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">PA RTK</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
