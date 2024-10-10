import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = await getToken({ req });
        if (!token || !token.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(token.sub);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const { task_is_complete } = await req.json();
        const taskId = parseInt(params.id);

        if (isNaN(taskId)) {
            return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
        }

        const task = await prisma.task.findUnique({
            where: { task_id: taskId },
            include: { workspace: true }
        });

        if (!task || task.workspace.user_user_id !== userId) {
            return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
        }

        const updatedTask = await prisma.task.update({
            where: { task_id: taskId },
            data: { task_is_complete },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}