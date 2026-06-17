import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/api';
import { Activity, Lock, User, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Sync mode state if initialMode changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            if (data.success) {
                onLoginSuccess();
            } else {
                setError(data.message);
            }
        },
        onError: (error) => {
            const data = error.response?.data;
            if (data?.error) {
                if (Array.isArray(data.error)) {
                    setError(data.error.join('. '));
                } else if (typeof data.error === 'string') {
                    setError(data.error);
                } else {
                    setError(data.message || 'Validation failed');
                }
            } else {
                setError(data?.message || 'Failed to connect to server');
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            if (data.success) {
                onLoginSuccess();
            } else {
                setError(data.message);
            }
        },
        onError: (error) => {
            const data = error.response?.data;
            if (data?.error) {
                if (Array.isArray(data.error)) {
                    setError(data.error.join('. '));
                } else if (typeof data.error === 'string') {
                    setError(data.error);
                } else {
                    setError(data.message || 'Validation failed');
                }
            } else {
                setError(data?.message || 'Failed to connect to server');
            }
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (mode === 'login') {
            loginMutation.mutate({ username, password });
        } else {
            registerMutation.mutate({ username, email, password });
        }
    };

    const isPending = loginMutation.isPending || registerMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white via-[#EBEBEB]/30 to-[#A7E46A]/10 relative overflow-hidden font-sans">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-[40rem] h-[40rem] rounded-full filter blur-3xl opacity-20 bg-[#A7E46A] top-[-15rem] right-[-15rem] animate-pulse"></div>
                <div className="absolute w-[40rem] h-[40rem] rounded-full filter blur-3xl opacity-25 bg-[#A8DFF8] bottom-[-15rem] left-[-15rem] animate-pulse [animation-delay:1.5s]"></div>
            </div>

            <div className="w-full max-w-md bg-white border border-[#EBEBEB] rounded-3xl shadow-xl shadow-slate-100 relative z-10 p-6 sm:p-8">
                <div className="flex flex-col gap-3 text-center mb-6">
                    <div 
                        className="mx-auto w-14 h-14 bg-[#222026] rounded-2xl flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-all duration-300"
                        onClick={() => navigate('/')}
                    >
                        <Activity className="w-7 h-7 text-[#A7E46A]" />
                    </div>
                    <h1 className="text-2xl font-black text-[#222026] m-0 mt-2 tracking-tight">
                        {mode === 'login' ? 'API Monitor' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {mode === 'login' ? 'Sign in to access your dashboard' : 'Join Sendry and start monitoring APIs'}
                    </p>
                </div>
                
                <div>
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-semibold">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="username" className="text-xs font-semibold text-[#222026]/70 uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isPending}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#EBEBEB] rounded-xl text-[#222026] text-sm placeholder-slate-400 focus:outline-none focus:border-[#222026] focus:ring-1 focus:ring-[#222026] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-[#222026]/70 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isPending}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#EBEBEB] rounded-xl text-[#222026] text-sm placeholder-slate-400 focus:outline-none focus:border-[#222026] focus:ring-1 focus:ring-[#222026] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-xs font-semibold text-[#222026]/70 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isPending}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-[#EBEBEB] rounded-xl text-[#222026] text-sm placeholder-slate-400 focus:outline-none focus:border-[#222026] focus:ring-1 focus:ring-[#222026] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-[#222026] text-white font-bold rounded-full py-3 px-4 text-sm hover:bg-slate-800 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                            disabled={isPending}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-[#A7E46A]" />
                                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    mode === 'login' ? 'Sign In' : 'Sign Up'
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {mode === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <button 
                                    onClick={() => { setMode('register'); setError(''); }} 
                                    className="text-[#222026] font-bold hover:underline bg-none border-none p-0 cursor-pointer"
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button 
                                    onClick={() => { setMode('login'); setError(''); }} 
                                    className="text-[#222026] font-bold hover:underline bg-none border-none p-0 cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
