"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ui/home.module.css';
import Login from "./components/Login";
import Register from "./components/Register";
import TaskList from "@/app/components/TaskList"
import { Button } from "@/components/ui/button";

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return (
            <div className={styles.container}>
                <header>
                    <h2 className={styles.titulo}>Bem vindo(a) a sua lista de afazeres</h2>
                </header>
                <div className={styles.authContainer}>
                    <div className={styles.authToggle}>
                        <Button
                            onClick={() => setShowLogin(true)}
                            variant={showLogin ? "default" : "outline"}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => setShowLogin(false)}
                            variant={!showLogin ? "default" : "outline"}
                        >
                            Cadastro
                        </Button>
                    </div>
                    {showLogin ?
                        <Login setIsLoggedIn={setIsLoggedIn} /> :
                        <Register setIsLoggedIn={setIsLoggedIn} />
                    }
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.titulo}>Sua lista de afazeres</h2>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
            </header>
            <TaskList />
        </div>
    );
}