import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateRTKPdf } from "@/lib/pdf-generator"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface RequesterInfo {
  fullName: string
  address: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, requesterInfo } = (await request.json()) as {
      requestId: string
      requesterInfo: RequesterInfo
    }

    // Fetch the request with agency info
    const { data: rtkRequest, error: fetchError } = await supabase
      .from("rtk_requests")
      .select(`
        *,
        agencies (
          name,
          rtk_officer_name,
          rtk_officer_email,
          address,
          city,
          state,
          zip
        )
      `)
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !rtkRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const agency = rtkRequest.agencies as any

    if (!agency.rtk_officer_email) {
      return NextResponse.json(
        { error: "Agency does not have an RTK officer email on file" },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBytes = await generateRTKPdf({
      agencyName: agency.name,
      agencyAddress: [agency.address, agency.city, agency.state, agency.zip]
        .filter(Boolean)
        .join(", "),
      rtkOfficerName: agency.rtk_officer_name || "RTK Officer",
      requesterName: requesterInfo.fullName,
      requesterAddress: requesterInfo.address,
      requesterCity: requesterInfo.city,
      requesterState: requesterInfo.state,
      requesterZip: requesterInfo.zip,
      requesterEmail: requesterInfo.email,
      requesterPhone: requesterInfo.phone,
      requestText: rtkRequest.request_text,
    })

    // Convert to base64 for email attachment
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "PA RTK Requests <noreply@resend.dev>",
      to: agency.rtk_officer_email,
      cc: requesterInfo.email,
      subject: `Right-to-Know Request - ${requesterInfo.fullName}`,
      html: `
        <p>Dear ${agency.rtk_officer_name || "RTK Officer"},</p>
        
        <p>Please find attached a Right-to-Know request submitted pursuant to Pennsylvania's Right-to-Know Law (65 P.S. § 67.101 et seq.).</p>
        
        <p><strong>Requester:</strong> ${requesterInfo.fullName}<br>
        <strong>Email:</strong> ${requesterInfo.email}<br>
        ${requesterInfo.phone ? `<strong>Phone:</strong> ${requesterInfo.phone}<br>` : ""}
        </p>
        
        <p><strong>Records Requested:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; margin: 12px 0; color: #555;">
          ${rtkRequest.request_text.replace(/\n/g, "<br>")}
        </blockquote>
        
        <p>I am requesting that responsive records be provided electronically to ${requesterInfo.email}.</p>
        
        <p>Under the RTKL, you have five business days to respond to this request.</p>
        
        <p>Thank you for your assistance.</p>
        
        <p>Sincerely,<br>
        ${requesterInfo.fullName}</p>
        
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888;">
          This request was submitted via PA RTK Request Tool.
        </p>
      `,
      attachments: [
        {
          filename: `RTK_Request_${agency.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if (emailError) {
      console.error("Email send error:", emailError)
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      )
    }

    // Calculate response due date (5 business days)
    const responseDueDate = new Date()
    let daysAdded = 0
    while (daysAdded < 5) {
      responseDueDate.setDate(responseDueDate.getDate() + 1)
      const dayOfWeek = responseDueDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++
      }
    }

    // Update request status
    await supabase
      .from("rtk_requests")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        response_due_date: responseDueDate.toISOString(),
      })
      .eq("id", requestId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Send request error:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
