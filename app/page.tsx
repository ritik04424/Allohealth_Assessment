'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type InventoryLevel = {
  id: string
  totalUnits: number
  reservedUnits: number
  warehouse: { id: string; name: string; location: string }
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  inventoryLevels: InventoryLevel[]
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const reserve = async (productId: string, warehouseId: string) => {
    setError('')
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to reserve')
      return
    }
    router.push(`/reservations/${data.id}`)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Allo Inventory</h1>
      <p className="text-gray-500 mb-8">Available products across warehouses</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-500">{product.description}</p>
              </div>
              <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
            </div>
            <div className="grid gap-3">
              {product.inventoryLevels.map(level => {
                const available = level.totalUnits - level.reservedUnits
                return (
                  <div key={level.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div>
                      <p className="font-medium">{level.warehouse.name}</p>
                      <p className="text-sm text-gray-500">{available} units available</p>
                    </div>
                    <button
                      onClick={() => reserve(product.id, level.warehouse.id)}
                      disabled={available === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      {available === 0 ? 'Out of stock' : 'Reserve'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}