import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your contact information for RTK requests
        </p>
      </div>
      <ProfileForm profile={profile} userId={user?.id || ""} />
    </div>
  )
}
