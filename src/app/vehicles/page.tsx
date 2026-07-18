'use client'

import { useEffect, useState } from 'react'

type Vehicle = {
  id: number
  make: string
  model: string
  plateNumber: string
  customerId: number
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(true)

  const loadVehicles = async () => {
    setLoading(true)
    const res = await fetch('/api/vehicles')
    const data = await res.json()
    setVehicles(data)
    setLoading(false)
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        make,
        model,
        plateNumber,
        customerId: Number(customerId),
      }),
    })
    setMake('')
    setModel('')
    setPlateNumber('')
    setCustomerId('')
    loadVehicles()
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
    loadVehicles()
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Vehicles</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
        <input
          className="border p-2 rounded"
          placeholder="Make (e.g. Toyota)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Model (e.g. Corolla)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Plate Number"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Customer ID"
          type="number"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        />
        <button type="submit" className="bg-black text-white py-2 rounded">
          Add Vehicle
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {v.make} {v.model}
                </p>
                <p className="text-sm text-gray-600">
                  Plate: {v.plateNumber} · Customer #{v.customerId}
                </p>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
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