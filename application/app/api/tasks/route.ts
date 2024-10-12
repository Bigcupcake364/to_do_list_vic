import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to serialize BigInt
const serializeBigInt = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v))
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
        return NextResponse.json({ message: 'Workspace ID is required' }, { status: 400 })
    }

    try {
        const tasks = await prisma.task.findMany({
            where: { workspace_workspace_id: parseInt(workspaceId) },
        })
        return NextResponse.json(serializeBigInt(tasks))
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const { workspaceId, taskName } = await request.json()

    if (!workspaceId || !taskName) {
        return NextResponse.json({ message: 'Workspace ID and task name are required' }, { status: 400 })
    }

    try {
        const task = await prisma.task.create({
            data: {
                task_name: taskName,
                task_is_complete: false,
                workspace_workspace_id: parseInt(workspaceId),
            },
        })
        return NextResponse.json(serializeBigInt(task))
    } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}