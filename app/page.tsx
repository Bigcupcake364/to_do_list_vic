'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Login from "@/app/components/Login"
import Register from "@/app/components/Register"
import TaskList from "@/app/components/TaskList"
import { LogOut } from "lucide-react"
import {
    NavigationMenu,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(true)
    const [userData, setUserData] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        const nickname = localStorage.getItem('nickname')
        if (userId && nickname) {
            setIsLoggedIn(true)
            setUserData({ userId, nickname })
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('nickname')
        setIsLoggedIn(false)
        setUserData(null)
    }

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto p-4">
                <NavigationMenu>
                        <NavigationMenuItem className={"w-full text-white"}>
                            <h1 className="text-2xl font-bold mb-0 bg-gray-900 p-4">Welcome to Your Todo List</h1>
                        </NavigationMenuItem>
                </NavigationMenu>
                <div className="space-y-4">
                    <div className="flex  bg-gray-950 p-4 items-end">
                        <Button onClick={() => setShowLogin(true)} variant={showLogin ? "default" : "outline"} >
                            Login
                        </Button>
                        <Button onClick={() => setShowLogin(false)} variant={!showLogin ? "default" : "outline"}>
                            Register
                        </Button>
                    </div>
                    {showLogin ? (
                        <Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />
                    ) : (
                        <Register setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div>
                <NavigationMenu className="bg-gray-900 p-4">
                    <NavigationMenuItem className={"mr-auto"}>
                        <h1 className="text-2xl font-bold text-white">Welcome To Your Todo List, {userData?.nickname || "User"}</h1>
                    </NavigationMenuItem>
                    <NavigationMenuItem className={"text-end"}>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-gray-700"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </NavigationMenuItem>
                </NavigationMenu>
            </div>
            <TaskList />
        </div>
    )
}
