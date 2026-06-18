import { jsPDF } from 'jspdf'
import type { Sale, Customer, ProductDetails } from '@/types'
import { calculateMailerTotal, MAILER_PRICES, type MailerSizeOption } from '@/utils/mailerPricing'
import avidsphereLogo from '../../../Assets/logo.png'

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const CARD_GAP = 8
const CARD_PADDING = 10
const FOOTER_Y = PAGE_HEIGHT - 12
const HEADER_LOGO_MAX_WIDTH = 108
const HEADER_LOGO_MAX_HEIGHT = 50
const FOOTER_LOGO_MAX_WIDTH = 42
const FOOTER_LOGO_MAX_HEIGHT = 20
const EMBEDDED_LOGO_MAX_WIDTH = 600

const PINK = '#F21B7F'
const PURPLE = '#472773'
const BLUE = '#398CBF'
const SOFT_GRAY = '#F2F2F2'
const LABEL = '#475569'

type PdfRow = [label: string, value: unknown]
type EmbeddedImage = {
  dataUrl: string
  width: number
  height: number
}

let logoPromise: Promise<EmbeddedImage | null> | null = null

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

function safeDate(value?: string) {
  const parsed = value ? new Date(value.includes('T') ? value : `${value}T00:00:00`) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10)
}

function formatDate(value?: string) {
  const parsed = new Date(`${safeDate(value)}T00:00:00`)
  return parsed.toLocaleDateString('en-US')
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.some(hasValue)
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function joinValues(values: unknown[], separator = ' - ') {
  return values.filter(hasValue).map(String).join(separator)
}

function getTotal(sale: Sale) {
  return Number(sale.digitalFinalTotal ?? sale.dollarAmount ?? sale.productDetails?.totalInvestment ?? 0)
}

function getPaymentMethod(sale: Sale) {
  const payment = sale.paymentMethod === 'Other'
    ? sale.otherPaymentMethod || 'Other'
    : sale.paymentMethod || 'Not specified'
  return payment.includes('Invoice') ? 'Invoice' : payment
}

function getMailerPricing(sale: Sale, details: ProductDetails) {
  const size = String(details.adSize || '')
  if (!(size in MAILER_PRICES)) {
    return {
      basePrice: Number(details.monthlyRate || 0),
      runTime: Number(details.mailerRunTime || 0),
      discountAmount: 0,
      designRequiredFee: sale.designRequired === 'Yes' ? 30 : 0,
      designChangeFee: sale.designChangeRequired === 'Yes' ? 15 : 0,
      total: getTotal(sale)
    }
  }
  return calculateMailerTotal({
    mailerSize: size as MailerSizeOption,
    runTime: Number(details.mailerRunTime || 0),
    discountType: (details.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage',
    discountValue: Number(details.discountValue || 0),
    designRequired: sale.designRequired === 'Yes',
    designChangeRequired: sale.designChangeRequired === 'Yes'
  })
}

function getPricingRows(sale: Sale): PdfRow[] {
  const details = sale.productDetails || {}
  if (sale.saleCategory === 'Mailer') {
    const pricing = getMailerPricing(sale, details)
    const rows: PdfRow[] = [
      ['Monthly Rate', formatCurrency(pricing.basePrice)],
      ['Run Time', `${pricing.runTime} Months`]
    ]
    if (pricing.discountAmount > 0) rows.push(['Discount', `-${formatCurrency(pricing.discountAmount)}`])
    if (pricing.designRequiredFee > 0) rows.push(['Design Required', formatCurrency(pricing.designRequiredFee)])
    if (pricing.designChangeFee > 0) rows.push(['Design Changes', formatCurrency(pricing.designChangeFee)])
    rows.push(['Total', formatCurrency(pricing.total)])
    return rows
  }

  if (sale.saleCategory === 'Print') {
    const projectPrice = Number(details.projectPrice || 0)
    const designFee = Number(details.designFee || 0)
    const total = getTotal(sale)
    const discount = Math.max(projectPrice + designFee - total, 0)
    const rows: PdfRow[] = [['Project Price', formatCurrency(projectPrice)]]
    if (designFee > 0) rows.push(['Design Fee', formatCurrency(designFee)])
    if (discount > 0) rows.push(['Discount', `-${formatCurrency(discount)}`])
    rows.push(['Total', formatCurrency(total)])
    return rows
  }

  const servicePrice = Number(details.servicePrice || 0)
  const total = getTotal(sale)
  const discount = Math.max(servicePrice - total, 0)
  const rows: PdfRow[] = [['Service Price', formatCurrency(servicePrice)]]
  if (discount > 0) rows.push(['Discount', `-${formatCurrency(discount)}`])
  rows.push(['Total', formatCurrency(total)])
  return rows
}

function getPurchasedRows(sale: Sale): PdfRow[] {
  const details = sale.productDetails || {}
  const productName = details.service || details.printType || sale.saleType || sale.saleCategory
  const rows: PdfRow[] = [
    ['Product / Service', productName],
    ['Category', sale.saleCategory]
  ]

  if (sale.saleCategory === 'Mailer') {
    rows.push(
      ['Area', details.mailerArea],
      ['Ad Size', details.adSize],
      ['Start Month', details.month],
      ['Run Time', details.mailerRunTime ? `${details.mailerRunTime} Months` : '']
    )
  } else if (sale.saleCategory === 'Print') {
    rows.push(
      ['Quantity', details.quantity],
      ['Size', details.size],
      ['Finish', joinValues([details.finish, details.otherFinish])],
      ['Thickness', joinValues([details.thickness, details.otherThickness])],
      ['Fold', details.fold]
    )
  } else {
    if (Array.isArray(details.socialPlatforms)) rows.push(['Platforms', details.socialPlatforms.join(', ')])
    if (Array.isArray(details.paidAdPlatforms)) rows.push(['Channels', details.paidAdPlatforms.join(', ')])
    rows.push(
      ['Website', details.websiteOption],
      ['Start Date', details.socialStartDate || details.campaignStartDate || details.startDate]
    )
  }

  return rows.filter(([, value]) => hasValue(value))
}

function getDetailsSection(sale: Sale): { title: string; rows: PdfRow[] } | null {
  const details = sale.productDetails || {}

  if (sale.saleCategory === 'Mailer') {
    return {
      title: 'Production Details',
      rows: [
        ['Design Required', sale.designRequired || 'No'],
        ['Design Change', sale.designChange || sale.designChangeRequired || 'No']
      ]
    }
  }

  if (sale.saleCategory === 'Print') {
    return {
      title: 'Production Details',
      rows: [
        ['Design Required', sale.designRequired || 'No'],
        ['Design Change', sale.designChange || sale.designChangeRequired || 'No'],
      ['Mailing Required', details.needsMailing || sale.needsMailing],
        ['Mailing Method', details.mailingOption],
        ['Finish', joinValues([details.finish, details.otherFinish])],
        ['Thickness', joinValues([details.thickness, details.otherThickness])],
        ['Fold', details.fold]
      ].filter(([, value]) => hasValue(value)) as PdfRow[]
    }
  }

  const service = String(details.service || '')
  const rows: PdfRow[] = []
  if (service === 'Social Media Management') {
    if (Array.isArray(details.socialPlatforms)) rows.push(['Platforms Managed', details.socialPlatforms.join(', ')])
    if (details.socialUsernames && typeof details.socialUsernames === 'object') {
      rows.push(['Usernames', Object.entries(details.socialUsernames).map(([key, value]) => `${key}: ${value}`).join(', ')])
    } else {
      rows.push(['Usernames', details.socialUsernames])
    }
    rows.push(
      ['Start Date', details.socialStartDate || details.startDate],
      ['Service Details', details.serviceDetails || details.campaignGoal],
      ['Legacy Service Notes', details.campaignNotes]
    )
  } else if (service === 'Website') {
    rows.push(
      ['Project Type', details.websiteOption],
      ['Website URL', details.websiteUrl],
      ['Landing Page', details.landingPageUrl],
      ['Project Scope', details.projectScope || joinValues([details.websitePrimaryGoal, details.pages])],
      ['Start Date', details.startDate],
      ['Legacy Project Notes', details.campaignNotes]
    )
  } else {
    const targeting = joinValues([
      details.targetAreas || details.targetGeography,
      details.targetLocations,
      details.demographicAge ? `Age: ${details.demographicAge}` : '',
      details.demographicSex ? `Gender: ${details.demographicSex}` : '',
      details.demographicIncome ? `Income: ${details.demographicIncome}` : ''
    ])
    rows.push(
      ['Channels', Array.isArray(details.paidAdPlatforms) ? details.paidAdPlatforms.join(', ') : ''],
      ['Campaign Type', details.campaignType],
      ['Creative Type', details.creativeType],
      ['Targeting', targeting],
      ['Monthly Ad Spend', hasValue(details.monthlyAdSpend) ? formatCurrency(details.monthlyAdSpend) : ''],
      ['Start Date', details.campaignStartDate || details.startDate],
      ['Goals / Objectives', details.campaignGoal],
      ['Legacy Campaign Notes', details.campaignNotes]
    )
  }

  const visibleRows = rows.filter(([, value]) => hasValue(value))
  return visibleRows.length ? { title: 'Campaign Details', rows: visibleRows } : null
}

function prepareLogoForPdf(imageUrl: string) {
  return new Promise<EmbeddedImage | null>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const sourceWidth = image.naturalWidth || image.width
      const sourceHeight = image.naturalHeight || image.height
      if (!sourceWidth || !sourceHeight) {
        resolve(null)
        return
      }
      const width = Math.min(sourceWidth, EMBEDDED_LOGO_MAX_WIDTH)
      const height = Math.round(width * (sourceHeight / sourceWidth))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        resolve(null)
        return
      }
      context.drawImage(image, 0, 0, width, height)
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height })
    }
    image.onerror = () => resolve(null)
    image.src = imageUrl
  })
}

async function loadLogo() {
  if (!logoPromise) {
    logoPromise = prepareLogoForPdf(avidsphereLogo).catch(() => null)
  }
  return logoPromise
}

function containImage(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight)
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale
  }
}

export function makeAgreementFilename(sale: Sale, customer?: Customer) {
  const safeName = String(customer?.businessName || sale.businessName || 'Agreement')
    .replace(/[\\/:*?"<>|]+/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return `Avidsphere_Agreement_${safeName || 'Agreement'}_${safeDate(sale.saleDate)}.pdf`
}

export async function generateAgreementPdfBase64(sale: Sale, customer?: Customer) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const logo = await loadLogo()
  const client = customer || ({
    businessName: sale.businessName || 'N/A',
    contactPerson: '',
    businessAddress: '',
    emailAddress: '',
    phoneNumber: ''
  } as Customer)
  const pricingRows = getPricingRows(sale)
  let y = MARGIN

  doc.setFont('helvetica', 'normal')
  if (logo) {
    try {
      const size = containImage(
        logo.width,
        logo.height,
        HEADER_LOGO_MAX_WIDTH,
        HEADER_LOGO_MAX_HEIGHT
      )
      doc.addImage(logo.dataUrl, 'PNG', MARGIN, y, size.width, size.height, 'avidsphere-logo')
    } catch {
      // The text header remains usable when an image format cannot be decoded.
    }
  }
  const headerTextX = MARGIN + HEADER_LOGO_MAX_WIDTH + 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(PURPLE)
  doc.text('Avidsphere Advertising Agreement', headerTextX, y + 19)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BLUE)
  doc.text('Client authorization and service summary', headerTextX, y + 35)
  doc.setFontSize(8)
  doc.setTextColor(LABEL)
  doc.text(`Agreement date: ${formatDate(sale.saleDate)}`, PAGE_WIDTH - MARGIN, y + 49, { align: 'right' })

  y += 60
  doc.setDrawColor(PURPLE)
  doc.setLineWidth(1)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  doc.setDrawColor(PINK)
  doc.setLineWidth(2.5)
  doc.line(MARGIN, y, MARGIN + 92, y)
  y += 16

  function drawCard(x: number, top: number, width: number, height: number, fill = SOFT_GRAY) {
    doc.setFillColor(fill)
    doc.setDrawColor(210)
    doc.roundedRect(x, top, width, height, 8, 8, 'FD')
  }

  function fitLines(value: unknown, width: number, maxLines = 2, fontSize = 8) {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(String(value || 'N/A'), width) as string[]
    if (lines.length <= maxLines) return lines
    const limited = lines.slice(0, maxLines)
    let last = limited[maxLines - 1]
    while (last.length > 1 && doc.getTextWidth(`${last}...`) > width) last = last.slice(0, -1)
    limited[maxLines - 1] = `${last}...`
    return limited
  }

  function drawRowsCard(title: string, rows: PdfRow[], maxHeight: number, valueOffset = 112) {
    const visibleRows = rows.slice(0, 8)
    const valueWidth = CONTENT_WIDTH - CARD_PADDING * 2 - valueOffset
    let fontSize = 8
    let rowGap = 11
    let prepared = visibleRows.map(([label, value]) => ({
      label,
      lines: fitLines(value, valueWidth, 2, fontSize)
    }))
    let height = 36 + prepared.reduce((sum, row) => sum + Math.max(row.lines.length * rowGap, rowGap), 0)

    if (height > maxHeight) {
      fontSize = 7
      rowGap = 9
      prepared = visibleRows.map(([label, value]) => ({
        label,
        lines: fitLines(value, valueWidth, 1, fontSize)
      }))
      height = Math.min(maxHeight, 36 + prepared.length * rowGap)
    }

    drawCard(MARGIN, y, CONTENT_WIDTH, height)
    doc.setFontSize(11)
    doc.setTextColor(PURPLE)
    doc.text(title, MARGIN + CARD_PADDING, y + 18)
    doc.setDrawColor(210)
    doc.line(MARGIN, y + 26, PAGE_WIDTH - MARGIN, y + 26)

    let rowY = y + 40
    prepared.forEach((row) => {
      if (rowY > y + height - 5) return
      doc.setFontSize(fontSize)
      doc.setTextColor(LABEL)
      doc.text(row.label, MARGIN + CARD_PADDING, rowY)
      doc.setTextColor(20)
      doc.text(row.lines, MARGIN + CARD_PADDING + valueOffset, rowY)
      rowY += Math.max(row.lines.length * rowGap, rowGap)
    })
    y += height + CARD_GAP
  }

  drawCard(MARGIN, y, CONTENT_WIDTH, 88, '#FFFFFF')
  doc.setFillColor(PURPLE)
  doc.roundedRect(MARGIN, y, 4, 88, 2, 2, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(PURPLE)
  doc.text('Customer Information', MARGIN + CARD_PADDING, y + 18)
  doc.setFont('helvetica', 'normal')
  const customerRows: PdfRow[] = [
    ['Business Name', client.businessName],
    ['Contact', client.contactPerson],
    ['Address', client.businessAddress],
    ['Email', client.emailAddress],
    ['Phone', client.phoneNumber]
  ]
  let customerY = y + 34
  customerRows.forEach(([label, value]) => {
    doc.setFontSize(8)
    doc.setTextColor(LABEL)
    doc.text(`${label}:`, MARGIN + CARD_PADDING, customerY)
    doc.setFontSize(9)
    doc.setTextColor(20)
    doc.text(fitLines(value, CONTENT_WIDTH - 140, 1, 9), MARGIN + 130, customerY)
    customerY += 11
  })
  y += 88 + 14

  const detailsSection = getDetailsSection(sale)
  const paymentNotes = sale.productDetails?.paymentNotes
  const bottomHeight = Math.max(82, 30 + pricingRows.length * 12)
  const paymentHeight = hasValue(paymentNotes) ? 62 : 48
  const reservedBottom = paymentHeight + CARD_GAP + bottomHeight + 28
  const availableForMiddle = PAGE_HEIGHT - MARGIN - y - reservedBottom
  const detailsAllowance = detailsSection ? Math.min(118, Math.max(72, availableForMiddle * 0.44)) : 0
  const productAllowance = Math.max(88, availableForMiddle - detailsAllowance - (detailsSection ? CARD_GAP : 0))

  drawRowsCard('Products Purchased', getPurchasedRows(sale), productAllowance, 110)
  if (detailsSection) drawRowsCard(detailsSection.title, detailsSection.rows, detailsAllowance, 104)

  drawCard(MARGIN, y, CONTENT_WIDTH, paymentHeight)
  doc.setFontSize(10)
  doc.setTextColor(PURPLE)
  doc.text('Payment Method', MARGIN + CARD_PADDING, y + 18)
  doc.setDrawColor(210)
  doc.line(MARGIN, y + 26, PAGE_WIDTH - MARGIN, y + 26)
  doc.setFontSize(9)
  doc.setTextColor(20)
  doc.text(getPaymentMethod(sale), MARGIN + CARD_PADDING, y + 42)
  if (hasValue(paymentNotes)) {
    doc.setFontSize(7)
    doc.setTextColor(LABEL)
    doc.text(fitLines(paymentNotes, CONTENT_WIDTH - 150, 1, 7), MARGIN + 145, y + 42)
  }
  y += paymentHeight + CARD_GAP

  const summaryWidth = 280
  const summaryX = PAGE_WIDTH - MARGIN - summaryWidth
  const signatureWidth = summaryX - MARGIN - CARD_GAP
  drawCard(MARGIN, y, signatureWidth, bottomHeight)
  drawCard(summaryX, y, summaryWidth, bottomHeight, '#FFFFFF')

  doc.setFontSize(10)
  doc.setTextColor(PURPLE)
  doc.text('Customer Authorization', MARGIN + CARD_PADDING, y + 18)
  doc.setFontSize(8)
  doc.setTextColor(LABEL)
  doc.text('Customer Signature', MARGIN + CARD_PADDING, y + 34)
  if (sale.customerSignatureImage) {
    try {
      const properties = doc.getImageProperties(sale.customerSignatureImage)
      const signatureSize = containImage(
        properties.width,
        properties.height,
        Math.min(140, signatureWidth - CARD_PADDING * 2),
        sale.customerSignatureDate ? 28 : 32
      )
      doc.addImage(
        sale.customerSignatureImage,
        'PNG',
        MARGIN + CARD_PADDING,
        y + 38,
        signatureSize.width,
        signatureSize.height
      )
    } catch {
      doc.line(MARGIN + CARD_PADDING, y + 48, MARGIN + signatureWidth - CARD_PADDING, y + 48)
    }
  } else {
    doc.setDrawColor(140)
    doc.line(MARGIN + CARD_PADDING, y + 48, MARGIN + signatureWidth - CARD_PADDING, y + 48)
  }
  if (sale.customerSignatureDate) {
    doc.setFontSize(7)
    doc.setTextColor(LABEL)
    doc.text(`Signed: ${formatDate(sale.customerSignatureDate)}`, MARGIN + CARD_PADDING, y + bottomHeight - 8)
  }

  doc.setFontSize(10)
  doc.setTextColor(LABEL)
  doc.text('Pricing Summary', summaryX + 14, y + 18)
  doc.setDrawColor(210)
  doc.line(summaryX + 14, y + 24, summaryX + summaryWidth - 14, y + 24)
  let priceY = y + 40
  pricingRows.forEach(([label, value]) => {
    const isTotal = label === 'Total'
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal')
    doc.setFontSize(isTotal ? 9 : 8)
    doc.setTextColor(LABEL)
    doc.text(label, summaryX + 14, priceY)
    doc.setFontSize(isTotal ? 11 : 9)
    doc.setTextColor(isTotal ? PINK : '#141414')
    doc.text(String(value), summaryX + summaryWidth - 14, priceY, { align: 'right' })
    priceY += 12
  })
  doc.setFont('helvetica', 'normal')

  doc.setDrawColor(220)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, FOOTER_Y - 19, PAGE_WIDTH - MARGIN, FOOTER_Y - 19)
  if (logo) {
    try {
      const size = containImage(
        logo.width,
        logo.height,
        FOOTER_LOGO_MAX_WIDTH,
        FOOTER_LOGO_MAX_HEIGHT
      )
      doc.addImage(
        logo.dataUrl,
        'PNG',
        MARGIN,
        FOOTER_Y - size.height + 3,
        size.width,
        size.height,
        'avidsphere-logo'
      )
    } catch {
      // Contact information remains intact if the optional footer logo cannot render.
    }
  }
  doc.setFontSize(7)
  doc.setTextColor(110)
  doc.text('PO Box 595 Blue Ball PA 17506', MARGIN + 62, FOOTER_Y)
  doc.text('avidsphereinc.com', MARGIN + 253, FOOTER_Y)
  doc.text('267-482-0890', PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' })

  return doc.output('datauristring').split(',')[1]
}

export async function downloadAgreementPdfFile(sale: Sale, customer?: Customer) {
  const base64 = await generateAgreementPdfBase64(sale, customer)
  const byteChars = atob(base64)
  const byteNumbers = new Uint8Array(byteChars.length)
  for (let index = 0; index < byteChars.length; index += 1) {
    byteNumbers[index] = byteChars.charCodeAt(index)
  }
  const blob = new Blob([byteNumbers], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = makeAgreementFilename(sale, customer)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  return link.download
}
