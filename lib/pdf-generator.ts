import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

interface RTKPdfData {
  agencyName: string
  agencyAddress: string
  rtkOfficerName: string
  requesterName: string
  requesterAddress: string
  requesterCity: string
  requesterState: string
  requesterZip: string
  requesterEmail: string
  requesterPhone: string
  requestText: string
}

export async function generateRTKPdf(data: RTKPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  const page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  
  const fontSize = 11
  const lineHeight = 14
  const margin = 72 // 1 inch margins
  const contentWidth = width - 2 * margin

  let y = height - margin

  // Helper function to draw text
  const drawText = (text: string, options: { bold?: boolean; size?: number; indent?: number } = {}) => {
    const font = options.bold ? timesRomanBold : timesRoman
    const size = options.size || fontSize
    const indent = options.indent || 0
    page.drawText(text, {
      x: margin + indent,
      y,
      font,
      size,
      color: rgb(0, 0, 0),
    })
    y -= lineHeight * (size / fontSize)
  }

  // Helper function to wrap and draw text
  const drawWrappedText = (text: string, options: { bold?: boolean; size?: number; indent?: number } = {}) => {
    const font = options.bold ? timesRomanBold : timesRoman
    const size = options.size || fontSize
    const indent = options.indent || 0
    const maxWidth = contentWidth - indent
    
    const words = text.split(" ")
    let line = ""
    
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      const testWidth = font.widthOfTextAtSize(testLine, size)
      
      if (testWidth > maxWidth && line) {
        page.drawText(line, {
          x: margin + indent,
          y,
          font,
          size,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight * (size / fontSize)
        line = word
      } else {
        line = testLine
      }
    }
    
    if (line) {
      page.drawText(line, {
        x: margin + indent,
        y,
        font,
        size,
        color: rgb(0, 0, 0),
      })
      y -= lineHeight * (size / fontSize)
    }
  }

  // Title
  drawText("PENNSYLVANIA RIGHT-TO-KNOW LAW REQUEST", { bold: true, size: 14 })
  y -= 10

  // Date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  drawText(`Date: ${today}`)
  y -= 10

  // Agency Info
  drawText("TO:", { bold: true })
  drawText(data.agencyName, { indent: 40 })
  if (data.agencyAddress) {
    drawText(data.agencyAddress, { indent: 40 })
  }
  drawText(`Attn: ${data.rtkOfficerName}`, { indent: 40 })
  y -= 10

  // Requester Info
  drawText("FROM:", { bold: true })
  drawText(data.requesterName, { indent: 40 })
  if (data.requesterAddress) {
    drawText(data.requesterAddress, { indent: 40 })
  }
  if (data.requesterCity || data.requesterState || data.requesterZip) {
    drawText(
      `${data.requesterCity}${data.requesterCity && data.requesterState ? ", " : ""}${data.requesterState} ${data.requesterZip}`.trim(),
      { indent: 40 }
    )
  }
  drawText(`Email: ${data.requesterEmail}`, { indent: 40 })
  if (data.requesterPhone) {
    drawText(`Phone: ${data.requesterPhone}`, { indent: 40 })
  }
  y -= 10

  // Request header
  drawText("REQUEST FOR RECORDS:", { bold: true })
  y -= 5

  // Request text - handle newlines
  const paragraphs = data.requestText.split("\n")
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      drawWrappedText(paragraph.trim())
    } else {
      y -= lineHeight / 2
    }
  }
  y -= 10

  // Delivery preference
  drawText("PREFERRED METHOD OF DELIVERY:", { bold: true })
  drawWrappedText(
    "I am requesting that responsive records be provided electronically via email to the address listed above. If electronic delivery is not possible, please contact me to discuss alternatives."
  )
  y -= 10

  // Fee waiver request
  drawText("FEE WAIVER REQUEST:", { bold: true })
  drawWrappedText(
    "If applicable, I request a waiver of fees as the disclosure of the requested information is in the public interest and will contribute significantly to public understanding of the operations or activities of the government."
  )
  y -= 10

  // Legal reference
  drawText("LEGAL AUTHORITY:", { bold: true })
  drawWrappedText(
    "This request is made pursuant to Pennsylvania's Right-to-Know Law (65 P.S. § 67.101 et seq.). Under this law, you are required to respond within five business days."
  )
  y -= 20

  // Signature
  drawText("Respectfully submitted,")
  y -= 20
  drawText(data.requesterName)
  drawText(`Email: ${data.requesterEmail}`)
  if (data.requesterPhone) {
    drawText(`Phone: ${data.requesterPhone}`)
  }

  // Footer
  y = margin
  page.drawText(
    "Generated by PA RTK Request Tool | https://pa-rtk.vercel.app",
    {
      x: margin,
      y,
      font: timesRoman,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    }
  )

  return pdfDoc.save()
}
