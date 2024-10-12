import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: Request) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!);
        (request as any).user = decoded;
        return NextResponse.next();
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export const config = {
    matcher: ['/api/tasks/:path*'],
};