import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const w1 = await prisma.warehouse.create({
    data: { name: 'Mumbai Warehouse', location: 'Mumbai, India' }
  })
  const w2 = await prisma.warehouse.create({
    data: { name: 'Delhi Warehouse', location: 'Delhi, India' }
  })
  const p1 = await prisma.product.create({
    data: { name: 'Wireless Headphones', description: 'Noise cancelling', price: 2999 }
  })
  const p2 = await prisma.product.create({
    data: { name: 'Mechanical Keyboard', description: 'RGB backlit', price: 4999 }
  })
  await prisma.inventoryLevel.createMany({
    data: [
      { productId: p1.id, warehouseId: w1.id, totalUnits: 10 },
      { productId: p1.id, warehouseId: w2.id, totalUnits: 5 },
      { productId: p2.id, warehouseId: w1.id, totalUnits: 3 },
      { productId: p2.id, warehouseId: w2.id, totalUnits: 8 },
    ]
  })
  console.log('Seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())