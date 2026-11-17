import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/api';
import { Lock, User, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F3F5F0] relative overflow-hidden font-sans">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#1FD27A]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#DCE7DF]/60 rounded-full blur-3xl pointer-events-none"></div>

            {/* Back to Home Link */}
            <div className="w-full max-w-md mb-4 flex justify-between items-center z-10">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0E1512] transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sendry.io</span>
                </Link>
                <span className="font-mono text-xs text-slate-400">MIT Open Source</span>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white border border-[#D9E1DB] rounded-3xl shadow-sm relative z-10 p-6 sm:p-8">
                <div className="flex flex-col gap-2.5 text-center mb-6">
                    <div 
                        className="mx-auto w-12 h-12 bg-[#1FD27A] rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate('/')}
                        title="Sendry Home"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-[#0E1512] font-['Bricolage_Grotesque',sans-serif] tracking-tight m-0 mt-1">
                        {mode === 'login' ? 'Sign in to Sendry' : 'Create your account'}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium m-0">
                        {mode === 'login' 
                            ? 'Enter your credentials to access live API monitoring' 
                            : 'Set up your workspace and start monitoring API hits in real time'}
                    </p>
                </div>
                
                <div>
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#D92D20] text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="username" className="text-xs font-bold text-[#0E1512] uppercase tracking-wider">
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
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9E1DB] rounded-xl text-[#0E1512] text-sm placeholder-slate-400 focus:outline-none focus:border-[#0E1512] focus:ring-2 focus:ring-[#1FD27A]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="e.g. sultanxdev"
                                />
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email" className="text-xs font-bold text-[#0E1512] uppercase tracking-wider">
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9E1DB] rounded-xl text-[#0E1512] text-sm placeholder-slate-400 focus:outline-none focus:border-[#0E1512] focus:ring-2 focus:ring-[#1FD27A]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-xs font-bold text-[#0E1512] uppercase tracking-wider">
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
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D9E1DB] rounded-xl text-[#0E1512] text-sm placeholder-slate-400 focus:outline-none focus:border-[#0E1512] focus:ring-2 focus:ring-[#1FD27A]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-[#0E1512] hover:bg-[#11503F] text-white font-bold rounded-xl py-3 px-4 text-sm active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 cursor-pointer border border-[#0E1512]"
                            disabled={isPending}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-[#1FD27A]" />
                                        <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                                    </>
                                ) : (
                                    <span>{mode === 'login' ? 'Sign In to Console' : 'Create Free Account'}</span>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500 font-medium">
                        {mode === 'login' ? (
                            <>
                                Don't have an account yet?{' '}
                                <button 
                                    onClick={() => { setMode('register'); setError(''); }} 
                                    className="text-[#0E1512] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Sign up free
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button 
                                    onClick={() => { setMode('login'); setError(''); }} 
                                    className="text-[#0E1512] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Sign in
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
