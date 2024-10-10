"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../ui/home.module.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginProps {
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                router.push('/');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ocorreu um erro ao fazer login.');
            }
        } catch (error) {
            setError('Ocorreu um erro ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authForm}>
            <h2 className={styles.authTitle}>Login</h2>
            <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                    <label htmlFor="username">Nome de Usuário</label>
                    <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Senha</label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
        </div>
    );
};

export default Login;