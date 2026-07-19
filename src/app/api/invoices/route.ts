import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()
        const { customerId, vehicleId, status, items } = body

        if (!customerId || !vehicleId || !status || !items) {
            return NextResponse.json({ error: 'customerId, vehicleId, status, and items are required' }, { status: 400 })
        }
        const invoice = await prisma.invoice.create({
            data: {
                customerId,
                vehicleId,
                status,
                items: {
                    create: items
                },
            },
        })
        return NextResponse.json(invoice, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const invoices = await prisma.invoice.findMany({
            orderBy: { id: 'desc' },
            include: {
                items: true,
                customer: true,
                vehicle: true,
            },
        })
        return NextResponse.json(invoices)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }
}