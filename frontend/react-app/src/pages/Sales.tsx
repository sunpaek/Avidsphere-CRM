import React, { useMemo, useState } from 'react'
import { useLocalStorageAdapter } from '@/hooks/useLocalStorageAdapter'
import type { Sale } from '@/types'
import SaleRecordCard from '@/components/SaleRecordCard'
import SaleForm from '@/components/SaleForm'

export default function Sales() {
  const { data, isLoading, error } = useLocalStorageAdapter()
  const [showForm, setShowForm] = useState(false)

  const salesWithCustomer = useMemo(() => {
    return data.sales.map<Sale & { customerName: string }>((sale) => {
      const matchingCustomer = data.customers.find((customer) => customer.id === sale.customerId)
      const customerName = matchingCustomer?.businessName || sale.businessName || 'Unknown customer'
      return { ...sale, customerName }
    })
  }, [data.customers, data.sales])

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-red-700">UPDATED SALES PAGE TEST</div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales History</h1>
            <p className="text-slate-600">Read-only view of the sales history stored in legacy CRM localStorage.</p>
          </div>
          <div>
            <button className="primary-btn" onClick={() => setShowForm(true)}>New Sale</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="sale-form-inline">
          <div className="mb-4 text-sm text-green-700">Sale form open</div>
          <SaleForm customers={data.customers} onClose={() => setShowForm(false)} />
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Unable to load sales history.</p>
          <p>{error.message}</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          Loading sales records...
        </div>
      ) : salesWithCustomer.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-700">
          <p className="text-lg font-semibold">No sales history found.</p>
          <p className="mt-2 text-sm text-slate-500">Sales records will appear here once the legacy CRM localStorage is populated.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {salesWithCustomer.map((sale) => (
            <SaleRecordCard key={sale.id} sale={sale} customerName={sale.customerName} />
          ))}
        </div>
      )}
    </div>
  )
}
