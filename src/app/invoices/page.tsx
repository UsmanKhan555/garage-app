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

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-10 border p-4 rounded">
        <select
          className="border p-2 rounded"
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

        <select
          className="border p-2 rounded"
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

        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Line Items</p>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="border p-2 rounded flex-1"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItemRow(index, 'description', e.target.value)}
              />
              <input
                className="border p-2 rounded w-24"
                placeholder="Price"
                type="number"
                value={item.price}
                onChange={(e) => updateItemRow(index, 'price', e.target.value)}
              />
              <input
                className="border p-2 rounded w-20"
                placeholder="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="text-red-600 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItemRow}
            className="text-sm text-blue-600 text-left"
          >
            + Add item
          </button>
        </div>

        <p className="font-semibold">Total: {draftTotal.toFixed(2)}</p>

        <button type="submit" className="bg-black text-white py-2 rounded">
          Create Invoice
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {invoices.map((inv) => (
            <li key={inv.id} className="border p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">
                    Invoice #{inv.id} — {inv.customer?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {inv.vehicle?.make} {inv.vehicle?.model}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    inv.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {inv.status}
                </span>
              </div>

              <ul className="text-sm text-gray-700 mb-2">
                {inv.items.map((item) => (
                  <li key={item.id}>
                    {item.description} — {item.price} x {item.quantity}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center">
                <p className="font-semibold">Total: {invoiceTotal(inv).toFixed(2)}</p>
                <div className="flex gap-3">
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => markAsPaid(inv.id)}
                      className="text-green-700 text-sm"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}