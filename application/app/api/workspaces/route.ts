import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    try {
        const workspaces = await prisma.workspace.findMany({
            where: { user_user_id: parseInt(userId) },
        })
        return NextResponse.json(workspaces)
    } catch (error) {
        console.error('Error fetching workspaces:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const { userId, workspaceName } = await request.json()

    if (!userId || !workspaceName) {
        return NextResponse.json({ message: 'User ID and workspace name are required' }, { status: 400 })
    }

    try {
        const workspace = await prisma.workspace.create({
            data: {
                workspace_name: workspaceName,
                user_user_id: parseInt(userId),
            },
        })
        return NextResponse.json(workspace)
    } catch (error) {
        console.error('Error creating workspace:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}