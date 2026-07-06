'use client'

import { useEffect, useState } from 'react'

type Customer = {
  id: number
  name: string
  phone: string
  email: string | null
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCustomers = async () => {
    setLoading(true)
    const res = await fetch('/api/customers')
    const data = await res.json()
    setCustomers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email: email || null }),
    })
    setName('')
    setPhone('')
    setEmail('')
    loadCustomers()
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    loadCustomers()
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bg-black text-white py-2 rounded">
          Add Customer
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {customers.map((c) => (
            <li
              key={c.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-600">
                  {c.phone} {c.email ? `· ${c.email}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}