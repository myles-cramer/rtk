import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { AgencyBrowser } from "@/components/agency-browser"

async function getFilterOptions() {
  const supabase = await createClient()
  
  // Get distinct counties
  const { data: counties } = await supabase
    .from("agencies")
    .select("county")
    .not("county", "is", null)
    .order("county")
  
  // Get distinct agency types
  const { data: types } = await supabase
    .from("agencies")
    .select("agency_type")
    .not("agency_type", "is", null)
    .order("agency_type")

  // Get distinct subtypes
  const { data: subtypes } = await supabase
    .from("agencies")
    .select("agency_subtype")
    .not("agency_subtype", "is", null)
    .order("agency_subtype")

  const uniqueCounties = [...new Set(counties?.map(c => c.county).filter(Boolean))]
  const uniqueTypes = [...new Set(types?.map(t => t.agency_type).filter(Boolean))]
  const uniqueSubtypes = [...new Set(subtypes?.map(s => s.agency_subtype).filter(Boolean))]

  return {
    counties: uniqueCounties as string[],
    types: uniqueTypes as string[],
    subtypes: uniqueSubtypes as string[],
  }
}

export default async function AgenciesPage() {
  const filterOptions = await getFilterOptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Agencies</h1>
        <p className="text-muted-foreground">
          Search and filter Pennsylvania government agencies to file RTK requests
        </p>
      </div>
      <Suspense fallback={<AgencyBrowserSkeleton />}>
        <AgencyBrowser filterOptions={filterOptions} />
      </Suspense>
    </div>
  )
}

function AgencyBrowserSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-10 w-full max-w-sm bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    </div>
  )
}
