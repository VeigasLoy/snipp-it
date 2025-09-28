import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase.ts';
import AuthLayout from '../components/AuthLayout';
import { ICONS } from '../constants';

interface LoginPageProps {
    onSwitchToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The user is automatically signed in, App.tsx will handle the redirect
        } catch (error: any) {
            setError("Invalid email or password.");
        }
    };

    return (
        <AuthLayout title="Log in to SnippIt" subtitle="Welcome back! Please enter your details.">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="relative block w-full px-3 py-4 text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg appearance-none placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] focus:z-10 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="relative block w-full px-3 py-4 text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg appearance-none placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] focus:z-10 sm:text-sm"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? ICONS.eyeSlashed : ICONS.eye}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-[var(--accent-primary)] bg-[var(--bg-secondary)] border-[var(--border-primary)] rounded focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-2" />
                        <label htmlFor="remember-me" className="block ml-2 text-sm text-[var(--text-secondary)]">Remember me</label>
                    </div>
                </div>

                <div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Log in
                    </button>
                </div>
            </form>
             <p className="pt-6 text-sm text-center text-[var(--text-secondary)]">
                Don't have an account?{' '}
                <button type="button" onClick={onSwitchToRegister} className="font-medium text-primary hover:text-primary/80">
                    Sign up
                </button>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;