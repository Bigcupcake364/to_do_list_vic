import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to serialize BigInt
const serializeBigInt = (data: any): any => {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v))
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { workspaceId, isComplete } = await request.json()
    const taskId = BigInt(params.id)

    if (!workspaceId) {
        return NextResponse.json({ message: 'Workspace ID is required' }, { status: 400 })
    }

    try {
        const task = await prisma.task.update({
            where: {
                task_id: taskId,
                workspace_workspace_id: parseInt(workspaceId)
            },
            data: { task_is_complete: isComplete },
        })
        return NextResponse.json(serializeBigInt(task))
    } catch (error) {
        console.error('Error updating task:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { workspaceId } = await request.json()
    const taskId = BigInt(params.id)

    if (!workspaceId) {
        return NextResponse.json({ message: 'Workspace ID is required' }, { status: 400 })
    }

    try {
        const deletedTask = await prisma.task.delete({
            where: {
                task_id: taskId,
                workspace_workspace_id: parseInt(workspaceId)
            },
        })
        return NextResponse.json({ message: 'Task deleted successfully', task: serializeBigInt(deletedTask) })
    } catch (error) {
        console.error('Error deleting task:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}