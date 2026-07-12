import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { id: 'desc' },
        })
        return NextResponse.json(vehicles)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
    }
}

export async function POST(req: NextRequest){
    try{
        const body = await req.json()
        const { make, model, plateNumber, customerId} = body

        if (!make || !model || !plateNumber || !customerId) {
            return NextResponse.json({ error: 'make, model, plateNumber, and customerId are required' }, { status: 400 })
        }
        const vehicle = await prisma.vehicle.create({
            data: { make, model, plateNumber, customerId },
        })
        return NextResponse.json(vehicle, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
    }
}

