import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RequestForm } from "@/components/request-form"

interface PageProps {
  searchParams: Promise<{ agency?: string }>
}

export default async function NewRequestPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!params.agency) {
    redirect("/dashboard/agencies")
  }

  // Fetch the agency
  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", params.agency)
    .single()

  if (!agency) {
    notFound()
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New RTK Request</h1>
        <p className="text-muted-foreground">
          Create a Right-to-Know request for {agency.name}
        </p>
      </div>
      <RequestForm agency={agency} profile={profile} userId={user.id} />
    </div>
  )
}
