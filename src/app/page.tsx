import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function formatCurrency(value: number) {
  return value.toLocaleString('en-AE', {
    style: 'currency',
    currency: 'AED',
  })
}

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function Home() {
  const [customerCount, vehicleCount, invoices] = await Promise.all([
    prisma.customer.count(),
    prisma.vehicle.count(),
    prisma.invoice.findMany({
      include: { items: true, customer: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const invoiceTotal = (invoice: (typeof invoices)[number]) =>
    invoice.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + invoiceTotal(inv), 0)

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + invoiceTotal(inv), 0)

  const recentInvoices = invoices.slice(0, 5)

  const stats = [
    { label: 'Total Customers', value: customerCount.toLocaleString() },
    { label: 'Total Vehicles', value: vehicleCount.toLocaleString() },
    { label: 'Total Invoices', value: invoices.length.toLocaleString() },
    { label: 'Unpaid Amount', value: formatCurrency(totalUnpaid), accent: 'text-amber-600' },
    { label: 'Paid Amount', value: formatCurrency(totalPaid), accent: 'text-emerald-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          An overview of customers, vehicles, and invoice activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className={`mt-2 text-2xl font-semibold text-slate-900 ${stat.accent ?? ''}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Invoices</h2>
          <Link
            href="/invoices"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all &rarr;
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">No invoices yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">#{inv.id}</td>
                  <td className="px-6 py-3 text-slate-600">{inv.customer?.name}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {inv.vehicle?.make} {inv.vehicle?.model}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{formatDate(inv.createdAt)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(invoiceTotal(inv))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
