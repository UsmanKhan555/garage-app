import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
){
    try{
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        const body = await req.json()
        const { make, model, plateNumber, customerId } = body

        const vehicle = await prisma.vehicle.update({
            where: { id: Number(id) },
            data: { make, model, plateNumber, customerId },
        })
        return NextResponse.json(vehicle)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
){
    try{
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        await prisma.vehicle.delete({
            where: { id: Number(id) },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
    }
}