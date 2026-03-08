import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Building2, Calendar, ChevronRight, AlertCircle, Plus } from "lucide-react"

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  pending: { label: "Pending", variant: "warning" as const },
  sent: { label: "Sent", variant: "default" as const },
  responded: { label: "Responded", variant: "success" as const },
  completed: { label: "Completed", variant: "success" as const },
  appealed: { label: "Appealed", variant: "warning" as const },
  denied: { label: "Denied", variant: "destructive" as const },
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from("rtk_requests")
    .select(`
      id,
      status,
      request_text,
      created_at,
      sent_at,
      response_due_date,
      agencies (
        id,
        name,
        agency_type,
        agency_subtype,
        county
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const activeRequests = requests?.filter((r) =>
    ["pending", "sent", "responded"].includes(r.status)
  )
  const draftRequests = requests?.filter((r) => r.status === "draft")
  const completedRequests = requests?.filter((r) =>
    ["completed", "denied", "appealed"].includes(r.status)
  )

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const RequestCard = ({ request }: { request: any }) => {
    const status = statusConfig[request.status as keyof typeof statusConfig] || {
      label: request.status,
      variant: "outline" as const,
    }

    return (
      <Link href={`/dashboard/requests/${request.id}`}>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium truncate">{request.agencies?.name}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {request.request_text}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {formatDate(request.created_at)}
                  </span>
                  {request.sent_at && (
                    <span>• Sent {formatDate(request.sent_at)}</span>
                  )}
                  {request.response_due_date && request.status === "sent" && (
                    <span className="text-amber-600">
                      • Due {formatDate(request.response_due_date)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={status.variant}>{status.label}</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground">
            Track and manage your Right-to-Know requests
          </p>
        </div>
        <Link href="/dashboard/agencies">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Active
            {activeRequests && activeRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            Drafts
            {draftRequests && draftRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {draftRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            {completedRequests && completedRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {completedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRequests && activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <EmptyState message="No active requests. Browse agencies to create one." />
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {draftRequests && draftRequests.length > 0 ? (
            draftRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <EmptyState message="No draft requests." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRequests && completedRequests.length > 0 ? (
            completedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <EmptyState message="No completed requests yet." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
