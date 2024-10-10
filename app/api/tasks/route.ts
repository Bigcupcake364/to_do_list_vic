import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token || !token.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(token.sub);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const tasks = await prisma.task.findMany({
            where: {
                workspace: {
                    user_user_id: userId
                }
            }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token || !token.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(token.sub);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const { task_name } = await req.json();

        if (!task_name) {
            return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
        }

        // Find or create a workspace for the user
        let workspace = await prisma.workspace.findFirst({
            where: { user_user_id: userId }
        });

        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    workspace_name: `${token.name || 'User'}'s Workspace`,
                    user_user_id: userId
                }
            });
        }

        const task = await prisma.task.create({
            data: {
                task_name,
                task_is_complete: false,
                workspace_workspace_id: workspace.workspace_id,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error adding task:', error);
        return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
    }
}