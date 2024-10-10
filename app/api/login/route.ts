// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (!user) {
            return NextResponse.json({ message: 'Usuário ou senha inválidos' }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign(
                { userId: user.user_id, username: user.username },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            return NextResponse.json({ message: 'Login bem-sucedido', token });
        } else {
            return NextResponse.json({ message: 'Usuário ou senha inválidos' }, { status: 401 });
        }
    } catch (error) {
        console.error('Erro ao processar login:', error);
        return NextResponse.json({ message: 'Erro ao processar a solicitação' }, { status: 500 });
    }
}