'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: number
  name: string
}

type Vehicle = {
  id: number
  make: string
  model: string
  customerId: number
}

type InvoiceItem = {
  id: number
  description: string
  price: string
  quantity: number
}

type Invoice = {
  id: number
  customerId: number
  vehicleId: number
  status: string
  createdAt: string
  items: InvoiceItem[]
  customer: Customer
  vehicle: Vehicle
}

type ItemDraft = {
  description: string
  price: string
  quantity: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [items, setItems] = useState<ItemDraft[]>([
    { description: '', price: '', quantity: '1' },
  ])

  const loadAll = async () => {
    setLoading(true)
    const [invRes, custRes, vehRes] = await Promise.all([
      fetch('/api/invoices'),
      fetch('/api/customers'),
      fetch('/api/vehicles'),
    ])
    setInvoices(await invRes.json())
    setCustomers(await custRes.json())
    setVehicles(await vehRes.json())
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  const addItemRow = () => {
    setItems([...items, { description: '', price: '', quantity: '1' }])
  }

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemRow = (index: number, field: keyof ItemDraft, value: string) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const draftTotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const qty = parseInt(item.quantity) || 0
    return sum + price * qty
  }, 0)

  const invoiceTotal = (invoice: Invoice) => {
    return invoice.items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanedItems = items
      .filter((item) => item.description && item.price)
      .map((item) => ({
        description: item.description,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity) || 1,
      }))

    if (cleanedItems.length === 0) return

    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: Number(customerId),
        vehicleId: Number(vehicleId),
        status: 'unpaid',
        items: cleanedItems,
      }),
    })

    setCustomerId('')
    setVehicleId('')
    setItems([{ description: '', price: '', quantity: '1' }])
    loadAll()
  }

  const markAsPaid = async (id: number) => {
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    })
    loadAll()
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    loadAll()
  }

  const filteredVehicles = vehicles.filter(
    (v) => v.customerId === Number(customerId)
  )

  const inputClasses =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">Create and track customer invoices.</p>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Create Invoice</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Customer</label>
              <select
                className={inputClasses}
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value)
                  setVehicleId('')
                }}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Vehicle</label>
              <select
                className={inputClasses}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                disabled={!customerId}
              >
                <option value="">Select Vehicle</option>
                {filteredVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-slate-600">Line Items</p>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={`${inputClasses} flex-1`}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItemRow(index, 'description', e.target.value)}
                />
                <input
                  className={`${inputClasses} w-24`}
                  placeholder="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItemRow(index, 'price', e.target.value)}
                />
                <input
                  className={`${inputClasses} w-20`}
                  placeholder="Qty"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="px-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    &#10005;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItemRow}
              className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + Add item
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-900">
              Total: <span className="font-normal text-slate-600">{draftTotal.toFixed(2)}</span>
            </p>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          All Invoices{' '}
          {!loading && <span className="font-normal text-slate-400">({invoices.length})</span>}
        </h2>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-slate-500">No invoices yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Invoice #{inv.id} &mdash; {inv.customer?.name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {inv.vehicle?.make} {inv.vehicle?.model}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    inv.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {inv.status}
                </span>
              </div>

              <div className="px-6 py-4">
                <ul className="flex flex-col gap-1 text-sm text-slate-600">
                  {inv.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.description} &times; {item.quantity}
                      </span>
                      <span>{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  Total: {invoiceTotal(inv).toFixed(2)}
                </p>
                <div className="flex gap-4">
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => markAsPaid(inv.id)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
