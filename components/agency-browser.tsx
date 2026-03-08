"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Building2, Mail, Phone, MapPin, ExternalLink, FileText, Loader2 } from "lucide-react"

interface Agency {
  id: string
  name: string
  agency_type: string | null
  agency_subtype: string | null
  county: string | null
  rtk_officer_name: string | null
  rtk_officer_email: string | null
  rtk_officer_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  oor_profile_url: string | null
}

interface FilterOptions {
  counties: string[]
  types: string[]
  subtypes: string[]
}

interface AgencyBrowserProps {
  filterOptions: FilterOptions
}

const ITEMS_PER_PAGE = 20

export function AgencyBrowser({ filterOptions }: AgencyBrowserProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [county, setCounty] = useState<string>("all")
  const [agencyType, setAgencyType] = useState<string>("all")
  const [page, setPage] = useState(1)
  const supabase = createClient()

  const fetchAgencies = useCallback(async () => {
    let query = supabase
      .from("agencies")
      .select("*", { count: "exact" })
      .order("name")
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }
    if (county && county !== "all") {
      query = query.eq("county", county)
    }
    if (agencyType && agencyType !== "all") {
      query = query.eq("agency_subtype", agencyType)
    }

    const { data, count, error } = await query

    if (error) throw error
    return { agencies: data as Agency[], total: count || 0 }
  }, [supabase, search, county, agencyType, page])

  const { data, error, isLoading } = useSWR(
    ["agencies", search, county, agencyType, page],
    fetchAgencies,
    { keepPreviousData: true }
  )

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, county, agencyType])

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0

  const handleCreateRequest = (agencyId: string) => {
    router.push(`/dashboard/requests/new?agency=${agencyId}`)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={county} onValueChange={setCounty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {filterOptions.counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agencyType} onValueChange={setAgencyType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Agency Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filterOptions.subtypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, data.total)} of {data.total.toLocaleString()} agencies
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-destructive">
          Error loading agencies. Please try again.
        </div>
      )}

      {/* Agency list */}
      {data && !isLoading && (
        <div className="space-y-4">
          {data.agencies.map((agency) => (
            <Card key={agency.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary shrink-0" />
                      {agency.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {agency.agency_subtype && (
                        <Badge variant="secondary">{agency.agency_subtype}</Badge>
                      )}
                      {agency.county && (
                        <Badge variant="outline">{agency.county} County</Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => handleCreateRequest(agency.id)} className="shrink-0 gap-2">
                    <FileText className="h-4 w-4" />
                    File Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  {agency.rtk_officer_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">RTK Officer:</span>
                      {agency.rtk_officer_name}
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
                      {agency.rtk_officer_phone}
                    </div>
                  )}
                  {(agency.address || agency.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {[agency.address, agency.city, agency.state, agency.zip]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {agency.oor_profile_url && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={agency.oor_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View on OOR
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
