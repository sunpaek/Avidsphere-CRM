import React, { useState } from 'react'
import type { Sale, Customer } from '@/types'
import SignaturePad from './SignaturePad'
import { downloadAgreementPdfFile } from '@/utils/agreementPdf'

interface Props {
  createSale: () => Sale
  customers: Customer[]
}

export default function AgreementActions({ createSale, customers }: Props) {
  const [open, setOpen] = useState(false)
  const [sale, setSale] = useState<Sale | null>(null)
  const [signature, setSignature] = useState<string | null>(null)

  function openPreview() {
    const s = createSale()
    setSale(s)
    setSignature(s.customerSignatureImage || null)
    setOpen(true)
  }

  function useSignatureInPreview() {
    if (!sale || !signature) return
    setSale({ ...sale, customerSignatureImage: signature })
  }

  async function downloadPdf() {
    if (!sale) return
    const customer = customers.find(c => c.id === sale.customerId)
    try {
      await downloadAgreementPdfFile(
        signature ? { ...sale, customerSignatureImage: signature } : sale,
        customer
      )
    } catch (err) {
      console.error('[AgreementActions] PDF generation failed', err)
      alert('Unable to generate PDF. See console for details.')
    }
  }

  return (
    <div className="agreement-actions">
      <h4>Agreement</h4>
      <p>Generate, preview, sign, and download agreement PDFs.</p>
      <div className="actions">
        <button type="button" onClick={openPreview} className="primary">Preview Agreement</button>
        <button type="button" onClick={downloadPdf} className="secondary" disabled={!sale}>Download PDF</button>
      </div>

      {open && sale && (
        <div className="modal-overlay">
          <div className="modal">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Agreement Preview</h3>
              <button onClick={() => setOpen(false)} aria-label="Close">x</button>
            </header>
            <div className="modal-body">
              <section>
                <h4>Summary</h4>
                <div><strong>Customer:</strong> {customers.find(c => c.id === sale.customerId)?.businessName || sale.businessName}</div>
                <div><strong>Type:</strong> {sale.saleCategory}</div>
                <div><strong>Products:</strong> {sale.productDetails ? JSON.stringify(sale.productDetails, null, 2) : 'N/A'}</div>
                <div><strong>Total:</strong> ${Number(sale.dollarAmount ?? sale.digitalFinalTotal ?? sale.productDetails?.totalInvestment ?? 0).toFixed(2)}</div>
              </section>

              <section style={{ marginTop: 12 }}>
                <h4>Customer Signature</h4>
                <SignaturePad onChange={(dataUrl) => setSignature(dataUrl)} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" onClick={useSignatureInPreview} className="primary" disabled={!signature}>Use Signature in Preview</button>
                </div>
                {sale.customerSignatureImage && (
                  <div style={{ marginTop: 8 }}>
                    <h5>Saved signature</h5>
                    <img src={sale.customerSignatureImage} alt="signature" style={{ maxWidth: 320, border: '1px solid #eee' }} />
                  </div>
                )}
              </section>
            </div>
            <footer style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => setOpen(false)} className="secondary">Close</button>
              <button onClick={downloadPdf} className="primary">Download PDF</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
