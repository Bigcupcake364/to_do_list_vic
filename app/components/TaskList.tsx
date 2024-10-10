'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Task {
    task_id: number
    task_name: string
    task_is_complete: boolean
}

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTaskName, setNewTaskName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { data: session, status } = useSession()

    const fetchTasks = async () => {
        if (!session) return
        setIsLoading(true)
        try {
            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${session.accessToken || ''}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }
            const data: Task[] = await response.json()
            setTasks(data)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast({
                title: "Error",
                description: "Failed to fetch tasks. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!session) return
        setIsLoading(true)
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken || ''}`
                },
                body: JSON.stringify({ task_name: newTaskName }),
            })

            if (!response.ok) {
                throw new Error('Failed to add task')
            }

            const addedTask: Task = await response.json()
            setTasks(prevTasks => [...prevTasks, addedTask])
            setNewTaskName('')
            toast({
                title: "Success",
                description: "Task added successfully.",
            })
        } catch (error) {
            console.error('Error adding task:', error)
            toast({
                title: "Error",
                description: "Failed to add task. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleComplete = async (taskId: number) => {
        if (!session) return
        setIsLoading(true)
        try {
            const taskToUpdate = tasks.find(t => t.task_id === taskId)
            if (!taskToUpdate) throw new Error('Task not found')

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken || ''}`
                },
                body: JSON.stringify({ task_is_complete: !taskToUpdate.task_is_complete }),
            })

            if (!response.ok) {
                throw new Error('Failed to update task')
            }

            const updatedTask: Task = await response.json()
            setTasks(prevTasks => prevTasks.map(task =>
                task.task_id === updatedTask.task_id ? updatedTask : task
            ))
            toast({
                title: "Success",
                description: `Task marked as ${updatedTask.task_is_complete ? 'complete' : 'incomplete'}.`,
            })
        } catch (error) {
            console.error('Error updating task:', error)
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchTasks()
        }
    }, [session])

    if (status === "loading") {
        return <div>Loading...</div>
    }

    if (status === "unauthenticated") {
        return <div>Please sign in to view your tasks.</div>
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Your Tasks</h1>
            {isLoading ? (
                <div className="text-center">Loading tasks...</div>
            ) : (
                <ul className="space-y-4">
                    {tasks.map(task => (
                        <li key={task.task_id} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                            <span className={task.task_is_complete ? "line-through text-gray-500" : ""}>{task.task_name}</span>
                            <Button
                                onClick={() => handleToggleComplete(task.task_id)}
                                variant={task.task_is_complete ? "outline" : "default"}
                                size="sm"
                            >
                                {task.task_is_complete ? 'Undo' : 'Complete'}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleAddTask} className="mt-6 flex space-x-2">
                <Input
                    type="text"
                    placeholder="New task name"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    required
                    className="flex-grow"
                />
                <Button type="submit" disabled={isLoading}>Add Task</Button>
            </form>
        </div>
    )
}