import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ error: 'status is required' }, { status: 400 })
        }

        const invoice = await prisma.invoice.update({
            where: { id: Number(id) },
            data: { status },
        })

        return NextResponse.json(invoice)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.invoice.delete({
            where: { id: Number(id) },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }
}