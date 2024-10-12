import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { username, nickname, password } = await request.json()

        const existingUser = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUser) {
            return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                nickname,
                password: hashedPassword,
                workspaces: {
                    create: [{ workspace_name: 'Default Workspace' }]
                }
            },
            include: { workspaces: true },
        })

        return NextResponse.json({
            message: 'User created successfully',
            userId: user.user_id,
            nickname: user.nickname,
            workspaces: user.workspaces,
        })
    } catch (error) {
        console.error('Error processing registration:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}