import React, { useMemo } from 'react'
import { useLocalStorageAdapter } from '@/hooks/useLocalStorageAdapter'
import type { Customer } from '@/types'

export default function Customers() {
  const { data, isLoading, error } = useLocalStorageAdapter()

  // Sort customers by last contact date (most recent first)
  const sortedCustomers = useMemo(() => {
    return [...data.customers].sort((a, b) => {
      const dateA = new Date(a.lastContactDate || a.dateCreated || 0).getTime()
      const dateB = new Date(b.lastContactDate || b.dateCreated || 0).getTime()
      return dateB - dateA
    })
  }, [data.customers])

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'prospect':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'lead':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Customers</h2>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Customers</h1>
        <p className="text-slate-600">
          {sortedCustomers.length} customer{sortedCustomers.length !== 1 ? 's' : ''} in database
        </p>
      </div>

      {sortedCustomers.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 text-lg">No customers found in database</p>
          <p className="text-slate-500 text-sm mt-2">Customer data will appear here once imported</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} getStatusColor={getStatusColor} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  )
}

interface CustomerCardProps {
  customer: Customer
  getStatusColor: (status?: string) => string
  formatDate: (dateString?: string) => string
}

function CustomerCard({ customer, getStatusColor, formatDate }: CustomerCardProps) {
  const recentActivity = customer.communicationHistory?.[0]
  const statusColor = getStatusColor(customer.customerStatus)

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header with Business Name and Status */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{customer.businessName}</h3>
        {customer.customerStatus && (
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mt-2 ${statusColor}`}>
            {customer.customerStatus}
          </span>
        )}
      </div>

      {/* Contact Person */}
      {customer.contactPerson && (
        <div className="mb-2 text-sm text-slate-700">
          <span className="font-medium">Contact:</span> {customer.contactPerson}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-1.5 mb-4 text-sm">
        {customer.phoneNumber && (
          <div className="flex items-center text-slate-600">
            <span className="font-medium mr-2">📞</span>
            <a href={`tel:${customer.phoneNumber}`} className="hover:text-blue-600 underline">
              {customer.phoneNumber}
            </a>
          </div>
        )}
        {customer.emailAddress && (
          <div className="flex items-center text-slate-600">
            <span className="font-medium mr-2">✉️</span>
            <a href={`mailto:${customer.emailAddress}`} className="hover:text-blue-600 underline truncate">
              {customer.emailAddress}
            </a>
          </div>
        )}
      </div>

      {/* Address */}
      {customer.businessAddress && (
        <div className="mb-3 text-xs text-slate-500 line-clamp-2">
          📍 {customer.businessAddress}
        </div>
      )}

      {/* Last Contact & Sales Rep */}
      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-3">
        <div>
          <span className="font-medium">Last Contact:</span> {formatDate(customer.lastContactDate || customer.dateCreated)}
        </div>
        {customer.assignedSalesRepresentative && (
          <div>
            <span className="font-medium">Sales Rep:</span> {customer.assignedSalesRepresentative}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div className="bg-blue-50 border border-blue-100 rounded p-2.5 text-xs">
          <div className="font-medium text-blue-900 mb-1">Recent Activity</div>
          <div className="text-blue-800">
            <span className="capitalize">{recentActivity.type}</span>
            {recentActivity.details && <p className="text-blue-700 mt-0.5">{recentActivity.details}</p>}
            {recentActivity.timestamp && <div className="text-blue-600 mt-1">{formatDate(recentActivity.timestamp)}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
