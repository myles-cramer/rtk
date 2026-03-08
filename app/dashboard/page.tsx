import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, FileText, Send, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's requests with agency info
  const { data: requests } = await supabase
    .from("rtk_requests")
    .select(`
      id,
      status,
      created_at,
      sent_at,
      agencies (
        name,
        agency_type
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch stats
  const { count: totalRequests } = await supabase
    .from("rtk_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  const { count: pendingRequests } = await supabase
    .from("rtk_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .in("status", ["pending", "sent"])

  const { count: completedRequests } = await supabase
    .from("rtk_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "completed")

  const { count: agencyCount } = await supabase
    .from("agencies")
    .select("*", { count: "exact", head: true })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "sent":
        return <Badge variant="default">Sent</Badge>
      case "responded":
        return <Badge variant="success">Responded</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "denied":
        return <Badge variant="destructive">Denied</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Right-to-Know requests
          </p>
        </div>
        <Link href="/dashboard/agencies">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencyCount?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>
            Your most recent Right-to-Know requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{request.agencies?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.agencies?.agency_type} • Created{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(request.status)}
                    <Link href={`/dashboard/requests/${request.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No requests yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by browsing agencies and creating your first request.
              </p>
              <Link href="/dashboard/agencies">
                <Button>Browse Agencies</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/agencies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Browse Agencies</CardTitle>
              <CardDescription>
                Search and filter through {agencyCount?.toLocaleString()} PA agencies
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/requests">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">My Requests</CardTitle>
              <CardDescription>
                View and manage all your RTK requests
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/profile">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <Send className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Update Profile</CardTitle>
              <CardDescription>
                Update your contact information for requests
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
