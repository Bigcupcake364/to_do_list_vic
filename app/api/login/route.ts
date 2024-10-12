import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        const user = await prisma.user.findUnique({
            where: { username },
            include: { workspaces: true },
        })

        if (!user) {
            return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (passwordMatch) {
            return NextResponse.json({
                message: 'Login successful',
                userId: user.user_id,
                nickname: user.nickname,
                workspaces: user.workspaces,
            })
        } else {
            return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 })
        }
    } catch (error) {
        console.error('Error processing login:', error)
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 })
    }
}