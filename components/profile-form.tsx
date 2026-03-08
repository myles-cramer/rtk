"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, CheckCircle2 } from "lucide-react"

interface Profile {
  id: string
  full_name: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  email: string | null
  phone: string | null
}

interface ProfileFormProps {
  profile: Profile | null
  userId: string
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "PA",
    zip: profile?.zip || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    try {
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: formData.fullName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        email: formData.email,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })

      setSuccess(true)
      router.refresh()
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            This information will be pre-filled when creating RTK requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Philadelphia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="PA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="19103"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(215) 555-1234"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Profile
            </Button>
            {success && (
              <span className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Profile saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
