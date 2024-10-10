import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username, password, nickname } = await request.json();

        if (!username || !password || !nickname) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                nickname,
                password: hashedPassword,
            },
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.user_id, username: newUser.username },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        // Return success response with token
        return NextResponse.json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.user_id,
                username: newUser.username,
                nickname: newUser.nickname
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
    }
}