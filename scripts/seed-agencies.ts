import { createClient } from "@supabase/supabase-js"
import { parse } from "csv-parse/sync"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CsvRow {
  OOR_ID: string
  Link: string
  Agency: string
  County: string
  Officer: string
  Phone: string
  Email1: string
  Email2: string
  website: string
  address: string
  type: string
  subtype: string
  county: string
  municipality: string
  school_district: string
}

function parseAddress(address: string): { address: string; city: string; state: string; zip: string } {
  // Address format: "123 Main Street , City, PA 12345"
  const parts = address.split(",").map((p) => p.trim())
  const streetParts: string[] = []
  let city = ""
  let state = "PA"
  let zip = ""

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    // Check if this part contains state and zip (e.g., "PA 17301")
    const stateZipMatch = part.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/)
    if (stateZipMatch) {
      state = stateZipMatch[1]
      zip = stateZipMatch[2]
      // Previous part is the city
      if (i > 0) {
        city = parts[i - 1]
        // Everything before city is street address
        streetParts.push(...parts.slice(0, i - 1))
      }
      break
    }
  }

  return {
    address: streetParts.join(", ").replace(/\s+,/g, ",").trim(),
    city,
    state,
    zip,
  }
}

async function seedAgencies() {
  console.log("Reading CSV file...")
  const csvPath = path.join(process.cwd(), "RTK_Contacts_Advanced.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")

  const records: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`Found ${records.length} agencies to import`)

  // Process in batches of 100
  const batchSize = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const agencies = batch.map((row) => {
      const { address, city, state, zip } = parseAddress(row.address || "")
      return {
        oor_id: row.OOR_ID || null,
        name: row.Agency,
        agency_type: row.type || null,
        agency_subtype: row.subtype || null,
        county: row.County || row.county || null,
        municipality: row.municipality || null,
        school_district: row.school_district || null,
        rtk_officer_name: row.Officer || null,
        rtk_officer_email: row.Email1 || null,
        rtk_officer_phone: row.Phone || null,
        address,
        city,
        state,
        zip,
        website: row.website || null,
        oor_profile_url: row.Link || null,
      }
    })

    const { error } = await supabase.from("agencies").upsert(agencies, {
      onConflict: "oor_id",
      ignoreDuplicates: false,
    })

    if (error) {
      console.error(`Error importing batch ${i / batchSize + 1}:`, error.message)
      errors += batch.length
    } else {
      imported += batch.length
      console.log(`Imported ${imported}/${records.length} agencies...`)
    }
  }

  console.log(`\nImport complete: ${imported} imported, ${errors} errors`)
}

seedAgencies().catch(console.error)
