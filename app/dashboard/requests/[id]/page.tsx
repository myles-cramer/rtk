import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  FileText,
} from "lucide-react"
import { RequestStatusUpdate } from "@/components/request-status-update"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sent?: string }>
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, description: "Not yet submitted" },
  pending: { label: "Pending", variant: "warning" as const, description: "Ready to send" },
  sent: { label: "Sent", variant: "default" as const, description: "Awaiting response" },
  responded: { label: "Responded", variant: "success" as const, description: "Agency has responded" },
  completed: { label: "Completed", variant: "success" as const, description: "Request fulfilled" },
  appealed: { label: "Appealed", variant: "warning" as const, description: "Under appeal" },
  denied: { label: "Denied", variant: "destructive" as const, description: "Request denied" },
}

export default async function RequestDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { sent } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: request, error } = await supabase
    .from("rtk_requests")
    .select(`
      *,
      agencies (
        id,
        name,
        agency_type,
        agency_subtype,
        county,
        rtk_officer_name,
        rtk_officer_email,
        rtk_officer_phone,
        address,
        city,
        state,
        zip,
        oor_profile_url
      )
    `)
    .eq("id", id)
    .eq("user_id", user?.id)
    .single()

  if (error || !request) {
    notFound()
  }

  const agency = request.agencies as any
  const status = statusConfig[request.status as keyof typeof statusConfig]

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      {/* Success message */}
      {sent === "true" && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Request sent successfully!</p>
            <p className="text-sm">Your RTK request has been emailed to {agency.rtk_officer_email}.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{agency.name}</h1>
          <p className="text-muted-foreground">
            {agency.agency_subtype && `${agency.agency_subtype} • `}
            {agency.county && `${agency.county} County`}
          </p>
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1 w-fit">
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Records Requested
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                  {request.request_text}
                </p>
              </div>

              {request.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Notes
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
                </div>
              )}

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {formatDate(request.created_at)}</span>
                </div>
                {request.sent_at && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Sent: {formatDate(request.sent_at)}</span>
                  </div>
                )}
                {request.response_due_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {formatDate(request.response_due_date)}</span>
                  </div>
                )}
                {request.response_received_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Response: {formatDate(request.response_received_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <RequestStatusUpdate requestId={request.id} currentStatus={request.status} />
        </div>

        {/* Sidebar - Agency Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Agency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {agency.rtk_officer_name && (
                <div>
                  <p className="text-muted-foreground">RTK Officer</p>
                  <p className="font-medium">{agency.rtk_officer_name}</p>
                </div>
              )}
              {agency.rtk_officer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${agency.rtk_officer_email}`}
                    className="text-primary hover:underline"
                  >
                    {agency.rtk_officer_email}
                  </a>
                </div>
              )}
              {agency.rtk_officer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{agency.rtk_officer_phone}</span>
                </div>
              )}
              {(agency.address || agency.city) && (
                <div className="text-muted-foreground">
                  {agency.address && <p>{agency.address}</p>}
                  {(agency.city || agency.state || agency.zip) && (
                    <p>
                      {agency.city}
                      {agency.city && agency.state && ", "}
                      {agency.state} {agency.zip}
                    </p>
                  )}
                </div>
              )}
              {agency.oor_profile_url && (
                <a
                  href={agency.oor_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on OOR
                </a>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.status === "draft" && (
                <Link href={`/dashboard/requests/new?agency=${agency.id}`} className="block">
                  <Button className="w-full">Continue Editing</Button>
                </Link>
              )}
              <Link href={`/dashboard/agencies`}>
                <Button variant="outline" className="w-full">
                  File Another Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
