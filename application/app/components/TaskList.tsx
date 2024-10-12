'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Task {
    task_id: string // Changed from bigint to string
    task_name: string
    task_is_complete: boolean
    workspace_workspace_id: number
}

interface Workspace {
    workspace_id: number
    workspace_name: string
}

export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState('')
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null)
    const [newWorkspaceName, setNewWorkspaceName] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    useEffect(() => {
        if (selectedWorkspace) {
            fetchTasks()
        }
    }, [selectedWorkspace])

    const fetchWorkspaces = async () => {
        const userId = localStorage.getItem('userId')
        if (!userId) return

        try {
            const response = await fetch(`/api/workspaces?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                setWorkspaces(data)
                if (data.length > 0 && !selectedWorkspace) {
                    setSelectedWorkspace(data[0].workspace_id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch workspaces:', error)
        }
    }

    const fetchTasks = async () => {
        if (!selectedWorkspace) return

        try {
            const response = await fetch(`/api/tasks?workspaceId=${selectedWorkspace}`)
            if (response.ok) {
                const data = await response.json()
                setTasks(data)
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedWorkspace || !newTask.trim()) return

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: selectedWorkspace, taskName: newTask }),
            })

            if (response.ok) {
                const task = await response.json()
                setTasks([...tasks, task])
                setNewTask('')
            }
        } catch (error) {
            console.error('Failed to add task:', error)
        }
    }

    const toggleTask = async (taskId: string) => {
        if (!selectedWorkspace) return

        try {
            const task = tasks.find(t => t.task_id === taskId)
            if (!task) return

            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: selectedWorkspace, isComplete: !task.task_is_complete }),
            })

            if (response.ok) {
                setTasks(tasks.map(task =>
                    task.task_id === taskId ? { ...task, task_is_complete: !task.task_is_complete } : task
                ))
            }
        } catch (error) {
            console.error('Failed to update task:', error)
        }
    }

    const deleteTask = async (taskId: string) => {
        if (!selectedWorkspace) return

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: selectedWorkspace }),
            })

            if (response.ok) {
                setTasks(tasks.filter(task => task.task_id !== taskId))
            }
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }

    const createWorkspace = async () => {
        const userId = localStorage.getItem('userId')
        if (!userId || !newWorkspaceName.trim()) return

        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, workspaceName: newWorkspaceName }),
            })

            if (response.ok) {
                const workspace = await response.json()
                setWorkspaces([...workspaces, workspace])
                setSelectedWorkspace(workspace.workspace_id)
                setNewWorkspaceName('')
                setIsDialogOpen(false)
            }
        } catch (error) {
            console.error('Failed to create workspace:', error)
        }
    }

    return (
        <div className="space-y-4 bg-gray-950 text-white p-4 min-w-max ">
            <div className="flex justify-between items-center">
                <Select
                    value={selectedWorkspace?.toString()}
                    onValueChange={(value) => setSelectedWorkspace(parseInt(value))}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a workspace" />
                    </SelectTrigger>
                    <SelectContent>
                        {workspaces.map((workspace) => (
                            <SelectItem key={workspace.workspace_id} value={workspace.workspace_id.toString()}>
                                {workspace.workspace_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-white">Create Workspace</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Workspace</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <Button onClick={createWorkspace}>Create Workspace</Button>
                    </DialogContent>
                </Dialog>
            </div>
            <form onSubmit={addTask} className="flex space-x-2">
                <Input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task"
                    className="flex-grow"
                />
                <Button type="submit">Add Task</Button>
            </form>
            <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.task_id} className="flex items-center space-x-2">
                        <Checkbox
                            checked={task.task_is_complete}
                            onCheckedChange={() => toggleTask(task.task_id)}
                            id={`task-${task.task_id}`}
                        />
                        <label
                            htmlFor={`task-${task.task_id}`}
                            className={`flex-grow ${task.task_is_complete ? 'line-through text-gray-500' : ''}`}
                        >
                            {task.task_name}
                        </label>
                        <Button onClick={() => deleteTask(task.task_id)} variant="destructive" size="sm">Delete</Button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
