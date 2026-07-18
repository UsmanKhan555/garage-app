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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Vehicles</h1>
        <p className="mt-1 text-sm text-slate-500">Track vehicles registered to customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Add Vehicle</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Make</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Model</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Corolla"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Plate Number
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Plate number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Customer ID
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Customer ID"
                  type="number"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Add Vehicle
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                All Vehicles{' '}
                {!loading && (
                  <span className="font-normal text-slate-400">({vehicles.length})</span>
                )}
              </h2>
            </div>

            {loading ? (
              <p className="px-6 py-8 text-sm text-slate-500">Loading...</p>
            ) : vehicles.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">No vehicles yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-3 font-medium">Vehicle</th>
                      <th className="px-6 py-3 font-medium">Plate</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {v.make} {v.model}
                        </td>
                        <td className="px-6 py-3 text-slate-600">{v.plateNumber}</td>
                        <td className="px-6 py-3 text-slate-600">#{v.customerId}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
