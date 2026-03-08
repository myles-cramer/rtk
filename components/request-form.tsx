"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Send, Save, Loader2, AlertCircle } from "lucide-react"

interface Agency {
  id: string
  name: string
  agency_type: string | null
  agency_subtype: string | null
  county: string | null
  rtk_officer_name: string | null
  rtk_officer_email: string | null
}

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

interface RequestFormProps {
  agency: Agency
  profile: Profile | null
  userId: string
}

const SAMPLE_REQUESTS = [
  {
    title: "Collective Bargaining Agreements",
    text: "All collective bargaining agreements currently in effect between the agency and any employee unions or associations, including any memoranda of understanding or side agreements.",
  },
  {
    title: "Superintendent/Administrator Contract",
    text: "The complete employment contract, including all addenda, for the Superintendent/Chief Administrator, including salary, benefits, severance terms, and any amendments.",
  },
  {
    title: "Statement of Financial Interest",
    text: "Statements of Financial Interest filed by all current elected officials and senior administrators for the most recent filing year.",
  },
  {
    title: "Budget Documents",
    text: "The current fiscal year adopted budget and any budget amendments, including line-item detail for all revenue sources and expenditures.",
  },
]

export function RequestForm({ agency, profile, userId }: RequestFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    requestText: "",
    fullName: profile?.full_name || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "PA",
    zip: profile?.zip || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const useSampleRequest = (text: string) => {
    setFormData((prev) => ({ ...prev, requestText: text }))
  }

  const validateForm = () => {
    if (!formData.requestText.trim()) {
      setError("Please enter your records request.")
      return false
    }
    if (!formData.fullName.trim()) {
      setError("Please enter your full name.")
      return false
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.")
      return false
    }
    if (!agency.rtk_officer_email) {
      setError("This agency does not have an RTK officer email on file.")
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from("rtk_requests")
        .insert({
          user_id: userId,
          agency_id: agency.id,
          request_text: formData.requestText,
          status: "draft",
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/dashboard/requests/${data.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to save draft")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // First, update the user's profile with their contact info
      await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          email: formData.email,
          phone: formData.phone,
        })

      // Create the request
      const { data: request, error: insertError } = await supabase
        .from("rtk_requests")
        .insert({
          user_id: userId,
          agency_id: agency.id,
          request_text: formData.requestText,
          status: "pending",
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Send the email via API
      const response = await fetch("/api/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          requesterInfo: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send request")
      }

      router.push(`/dashboard/requests/${request.id}?sent=true`)
    } catch (err: any) {
      setError(err.message || "Failed to submit request")
      setIsSubmitting(false)
    }
  }

  const missingProfile = !profile?.full_name || !profile?.email

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agency Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Agency Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{agency.name}</p>
          <div className="flex flex-wrap gap-2">
            {agency.agency_subtype && (
              <Badge variant="secondary">{agency.agency_subtype}</Badge>
            )}
            {agency.county && (
              <Badge variant="outline">{agency.county} County</Badge>
            )}
          </div>
          {agency.rtk_officer_name && (
            <p className="text-sm text-muted-foreground">
              RTK Officer: {agency.rtk_officer_name}
            </p>
          )}
          {agency.rtk_officer_email && (
            <p className="text-sm text-muted-foreground">
              Email: {agency.rtk_officer_email}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Request Text */}
      <Card>
        <CardHeader>
          <CardTitle>Records Request</CardTitle>
          <CardDescription>
            Describe the records you are requesting. Be as specific as possible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestText">Request Description</Label>
            <Textarea
              id="requestText"
              name="requestText"
              value={formData.requestText}
              onChange={handleChange}
              placeholder="I am requesting the following records..."
              rows={6}
              required
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Or use a sample request:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_REQUESTS.map((sample) => (
                <Button
                  key={sample.title}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useSampleRequest(sample.text)}
                >
                  {sample.title}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requester Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            This information will be included on your RTK request form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
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
            />
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting || !formData.requestText.trim()}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Generate PDF & Send
        </Button>
      </div>
    </form>
  )
}
