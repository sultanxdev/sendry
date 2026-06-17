import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Activity, ArrowRight, Shield, Zap, Database, 
    RefreshCw, Check, Menu, X, ChevronDown, 
    Terminal, ExternalLink, Cpu, BookOpen, Layers
} from 'lucide-react';

export function LandingPage({ isAuthenticated, onLogout }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState({});
    const navigate = useNavigate();

    const toggleFaq = (index) => {
        setFaqOpen(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const features = [
        {
            icon: <Cpu className="w-6 h-6 text-[#222026]" />,
            title: "Decoupled Event Queue",
            description: "Built on RabbitMQ. Ingested API hits are queued instantly (under 2ms) and processed in the background so your app's performance is never affected."
        },
        {
            icon: <Database className="w-6 h-6 text-[#222026]" />,
            title: "Dual-Database Storage",
            description: "MongoDB stores full JSON payloads of raw hits with automatic 30-day expiration, while PostgreSQL holds highly aggregated hourly metrics."
        },
        {
            icon: <Shield className="w-6 h-6 text-[#222026]" />,
            title: "Circuit Breaker Protection",
            description: "If downstream services or databases encounter downtime, circuit breakers safely trip to block ingestion locks and isolate issues."
        },
        {
            icon: <Zap className="w-6 h-6 text-[#222026]" />,
            title: "Zero-Dependency SDK",
            description: "Integrate with any Node.js / Express application in minutes. Lightweight, fire-and-forget middleware handles connection failures gracefully."
        },
        {
            icon: <RefreshCw className="w-6 h-6 text-[#222026]" />,
            title: "Resilient Retry & DLQs",
            description: "Temporary database glitches are bypassed automatically using exponential backoff retries with jitter, moving persistent failures to a Dead-Letter Queue."
        },
        {
            icon: <Layers className="w-6 h-6 text-[#222026]" />,
            title: "Granular RBAC Policies",
            description: "Manage multiple developer environments, clients, and API keys with detailed permissions. Restrict access based on administrative roles."
        }
    ];

    const faqs = [
        {
            question: "What is Sendry and how does it differ from other monitoring tools?",
            answer: "Sendry is an open-source, self-hostable API monitoring platform designed to add zero overhead to your production services. Unlike other SaaS tools that perform synchronous requests, Sendry uses RabbitMQ as a buffer, ensuring your API requests never wait on monitoring metrics to resolve."
        },
        {
            question: "Does Sendry affect the response time (latency) of my API?",
            answer: "No. The Sendry Express middleware runs asynchronously using a 'fire-and-forget' pattern. The HTTP response is delivered to your client immediately, while the hit data is sent to Sendry's ingestion queue in the background. Typical overhead is under 2 milliseconds."
        },
        {
            question: "Why does Sendry use both PostgreSQL and MongoDB?",
            answer: "We use a dual-database architecture. MongoDB is ideal for unstructured, high-write raw logs because we can set a 30-day Time-To-Live (TTL) index to clear old data automatically. PostgreSQL handles structured, aggregated hourly time-series metrics, allowing for extremely fast, low-cost analytical queries."
        },
        {
            question: "Is there a retry mechanism if RabbitMQ or the databases go down?",
            answer: "Yes. Sendry features double-sided resilience. The producer-side has an active Circuit Breaker that fails open if RabbitMQ becomes unreachable, preventing your API from hanging. On the consumer-side, the worker uses exponential backoff retry with random jitter to process failed database saves, eventual routing poisoned messages to a Dead-Letter Queue (DLQ)."
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#EBEBEB]/10 to-[#A7E46A]/5 text-[#222026] font-sans selection:bg-[#A7E46A] selection:text-[#222026] relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-[#A7E46A]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-[#A8DFF8]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-[30rem] h-[30rem] bg-[#A7E46A]/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EBEBEB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-9 h-9 rounded-xl bg-[#222026] flex items-center justify-center shadow-md">
                                <Activity className="w-5 h-5 text-[#A7E46A]" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-[#222026]">
                                Sendry
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors">Integration</a>
                            <a href="#faq" className="text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors">FAQ</a>
                            <Link to="/docs" className="text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors flex items-center gap-1">
                                <BookOpen className="w-4 h-4" /> Docs
                            </Link>
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="px-6 py-2.5 text-sm font-bold text-white bg-[#222026] hover:bg-slate-800 rounded-full shadow-md shadow-slate-200 transition-all duration-200">
                                        Go to Dashboard
                                    </Link>
                                    <button onClick={onLogout} className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors">
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-[#222026] transition-colors">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-[#222026] hover:bg-slate-800 rounded-full shadow-md shadow-slate-200 transition-all duration-200">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-[#222026] hover:bg-[#EBEBEB]/45 focus:outline-none"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-[#EBEBEB] px-2 pt-2 pb-4 space-y-1 sm:px-3">
                        <a 
                            href="#features" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-500 hover:text-[#222026] hover:bg-slate-50"
                        >
                            Features
                        </a>
                        <a 
                            href="#how-it-works" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-500 hover:text-[#222026] hover:bg-slate-50"
                        >
                            Integration
                        </a>
                        <a 
                            href="#faq" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-500 hover:text-[#222026] hover:bg-slate-50"
                        >
                            FAQ
                        </a>
                        <Link 
                            to="/docs" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-500 hover:text-[#222026] hover:bg-slate-50"
                        >
                            Documentation
                        </Link>
                        <hr className="border-[#EBEBEB] my-2" />
                        {isAuthenticated ? (
                            <div className="space-y-2 px-3 pt-2">
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2.5 font-bold text-white bg-[#222026] rounded-full">
                                    Go to Dashboard
                                </Link>
                                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="block w-full text-center px-4 py-2.5 font-bold text-slate-500 hover:text-[#222026]">
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 px-3 pt-2">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2.5 font-bold text-slate-500 hover:text-[#222026]">
                                    Sign In
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-2.5 font-bold text-white bg-[#222026] rounded-full">
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A7E46A]/40 bg-[#A7E46A]/10 text-slate-700 text-xs font-bold tracking-wide mb-6">
                    <Activity className="w-3.5 h-3.5 text-[#A7E46A] animate-pulse" />
                    <span>Real-time API Hit Monitoring & Logging</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#222026] max-w-4xl mx-auto leading-tight sm:leading-none">
                    Track Every API Hit with{" "}
                    <span className="text-[#A7E46A] bg-[#222026] px-5 py-2.5 rounded-2xl inline-block mt-2 font-black shadow-lg shadow-slate-900/10">
                        Zero Overhead
                    </span>
                </h1>
                
                <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold">
                    Decoupled backend observability built with RabbitMQ, PostgreSQL, and MongoDB. Drop one middleware line into any Express service and view live charts instantly.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#222026] hover:bg-slate-800 text-white font-bold rounded-full shadow-lg shadow-slate-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                            Access Your Dashboard <ArrowRight className="w-5 h-5 text-[#A7E46A]" />
                        </Link>
                    ) : (
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#222026] hover:bg-slate-800 text-white font-bold rounded-full shadow-lg shadow-slate-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                            Get Started Free <ArrowRight className="w-5 h-5 text-[#A7E46A]" />
                        </Link>
                    )}
                    <Link to="/docs" className="w-full sm:w-auto px-8 py-4 bg-[#EBEBEB] hover:bg-[#EBEBEB]/70 text-[#222026] font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2">
                        <Terminal className="w-5 h-5" /> Quick Start Guide
                    </Link>
                </div>

                {/* Dashboard Mockup Showcase (Inspired by EstateHub UI in prompt) */}
                <div className="mt-20 border border-[#EBEBEB] bg-white rounded-3xl p-3 shadow-2xl relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#A7E46A] to-[#A8DFF8] rounded-3xl blur opacity-25 pointer-events-none"></div>
                    <div className="bg-[#EBEBEB]/20 rounded-2xl border border-[#EBEBEB] overflow-hidden text-left shadow-inner">
                        {/* Tab header */}
                        <div className="flex items-center justify-between border-b border-[#EBEBEB] bg-white px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                <span className="text-xs text-[#222026] font-bold ml-2">Sendry Monitoring Dashboard</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-[#A7E46A]/20 px-2 py-0.5 rounded border border-[#A7E46A]/30">
                                <span className="w-2 h-2 rounded-full bg-[#A7E46A] animate-ping"></span>
                                Live Syncing
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* KPI 1 */}
                            <div className="border border-[#EBEBEB] bg-white rounded-2xl p-5 shadow-sm">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Ingested Hits</div>
                                <div className="text-2xl font-black text-[#222026] mt-1">2,841,095</div>
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1 font-bold">
                                    <span>↑ 12%</span> <span className="text-slate-400 font-medium">vs last hour</span>
                                </div>
                            </div>
                            {/* KPI 2 */}
                            <div className="border border-[#EBEBEB] bg-white rounded-2xl p-5 shadow-sm">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Latency</div>
                                <div className="text-2xl font-black text-[#222026] mt-1">34.8 ms</div>
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1 font-bold">
                                    <span>↓ 1.4ms</span> <span className="text-slate-400 font-medium">p99: 104ms</span>
                                </div>
                            </div>
                            {/* KPI 3 */}
                            <div className="border border-[#EBEBEB] bg-white rounded-2xl p-5 shadow-sm">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Error Rate</div>
                                <div className="text-2xl font-black text-rose-600 mt-1">0.08%</div>
                                <div className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-bold">
                                    <span>Stable</span> <span className="text-slate-400 font-medium">2 errors in 24h</span>
                                </div>
                            </div>
                            {/* KPI 4 */}
                            <div className="border border-[#EBEBEB] bg-white rounded-2xl p-5 shadow-sm">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Breaker Status</div>
                                <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#A7E46A]" /> Closed
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-1">
                                    Queue: Health checks normal
                                </div>
                            </div>
                        </div>

                        {/* Inner chart visualization mock */}
                        <div className="px-6 pb-6">
                            <div className="border border-[#EBEBEB] bg-white rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-sm text-[#222026]">API Response Times Over Time</h3>
                                        <p className="text-xs text-slate-500">Hourly aggregated latencies across active services</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-2.5 py-1 text-xs rounded-full border border-[#EBEBEB] bg-slate-50 text-slate-600 font-bold">auth-service</span>
                                        <span className="px-2.5 py-1 text-xs rounded-full border border-[#EBEBEB] bg-slate-50 text-slate-600 font-bold">payments-api</span>
                                    </div>
                                </div>
                                {/* Mock chart lines */}
                                <div className="h-40 flex items-end gap-2 w-full pt-4 relative">
                                    {/* Y-axis lines */}
                                    <div className="absolute left-0 right-0 border-t border-slate-100 top-1/4"></div>
                                    <div className="absolute left-0 right-0 border-t border-slate-100 top-2/4"></div>
                                    <div className="absolute left-0 right-0 border-t border-slate-100 top-3/4"></div>
                                    {/* Mock bars */}
                                    {[20, 24, 28, 22, 35, 45, 68, 52, 40, 32, 28, 24, 30, 35, 54, 75, 42, 38, 29, 32, 35, 30, 24, 28].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end h-full">
                                            <div 
                                                style={{ height: `${h}%` }} 
                                                className="w-full bg-gradient-to-t from-[#A7E46A] to-[#A8DFF8] rounded-t-md hover:from-[#A8DFF8] hover:to-[#A7E46A] transition-all duration-200 cursor-pointer relative group"
                                            >
                                                {/* Tooltip */}
                                                <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#222026] text-[10px] text-white rounded whitespace-nowrap shadow-xl z-20">
                                                    {h}ms (H-{24 - i})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Core Features Grid */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-[#EBEBEB]">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#222026]">
                        Built for Resilient, High-Volume Environments
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-slate-500 font-semibold">
                        Observability shouldn't cause downtime. Sendry decouples the ingest pipeline from databases to keep your servers lightning-fast under heavy load.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="group border border-[#EBEBEB] bg-white hover:border-[#A7E46A] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
                            {/* Card accent glow */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#A7E46A]/5 to-[#A8DFF8]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB]/50 border border-[#EBEBEB] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-[#A7E46A]/50 transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="font-bold text-lg text-[#222026] mb-2 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Integration Walkthrough */}
            <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-[#EBEBEB] bg-white/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#A8DFF8]/40 bg-[#A8DFF8]/10 text-slate-700 text-xs font-bold tracking-wide mb-6">
                            <span>Zero-Configuration SDK</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#222026] leading-tight">
                            Add Monitoring to Any Express App in Minutes
                        </h2>
                        <p className="mt-4 text-slate-500 leading-relaxed font-semibold">
                            Sendry is designed to be developer-first. The drop-in Node.js SDK overrides no server mechanics and operates entirely in the background, listening to response timers.
                        </p>

                        <ul className="mt-8 space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-[#222026] shrink-0 font-bold">
                                    <Check className="w-3 h-3 text-[#222026]" />
                                </div>
                                <span className="text-sm text-slate-600 font-semibold">Automatic response timer calculation (in milliseconds)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-[#222026] shrink-0 font-bold">
                                    <Check className="w-3 h-3 text-[#222026]" />
                                </div>
                                <span className="text-sm text-slate-600 font-semibold">Graceful timeout handling — if Sendry fails, your users experience no lag</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-[#222026] shrink-0 font-bold">
                                    <Check className="w-3 h-3 text-[#222026]" />
                                </div>
                                <span className="text-sm text-slate-600 font-semibold">Environment scoping support (Production, Staging, Dev)</span>
                            </li>
                        </ul>

                        <div className="mt-8">
                            <Link to="/docs" className="inline-flex items-center gap-2 text-[#222026] font-bold text-sm hover:underline group">
                                Learn SDK configurations <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#A7E46A]" />
                            </Link>
                        </div>
                    </div>

                    {/* Interactive Code Window */}
                    <div className="border border-[#EBEBEB] bg-[#222026] rounded-3xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#222026]/10 bg-black/10 px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                                <span className="text-xs text-slate-400 font-mono ml-2">middleware.js</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">Node.js / Express</span>
                        </div>
                        <pre className="p-6 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed bg-[#222026]">
                            <code>
<span className="text-slate-500">// 1. Copy the middleware SDK or write to monitoring.js</span>{"\n"}
<span className="text-[#A7E46A] font-bold">const</span> express = require(<span className="text-[#A8DFF8]">'express'</span>);{"\n"}
<span className="text-[#A7E46A] font-bold">const</span> monitoringMiddleware = require(<span className="text-[#A8DFF8]">'./monitoring'</span>);{"\n"}
<span className="text-[#A7E46A] font-bold">const</span> app = express();{"\n\n"}

<span className="text-slate-500">// 2. Initialize with configuration</span>{"\n"}
app.use(monitoringMiddleware({"\n"}
{"  "}serviceName: <span className="text-[#A8DFF8]">'blog-api'</span>,{"\n"}
{"  "}enableLogging: <span className="text-[#A7E46A] font-bold">false</span>,{"\n"}
{"  "}timeout: <span className="text-[#A8DFF8]">3000</span> <span className="text-slate-500">// Fail safe fallback (ms)</span>{"\n"}
{"}));\n\n"}

<span className="text-slate-500">// 3. In your server environment variables (.env):</span>{"\n"}
<span className="text-[#A8DFF8]">MONITORING_API_KEY</span>=apim_ef3f809d9c200e8f4f6e3dd2fad...{"\n"}
<span className="text-[#A8DFF8]">MONITORING_ENDPOINT</span>=http://localhost:5000/api/hit
                            </code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section */}
            <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-[#EBEBEB] bg-white/40">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#222026]">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-slate-500 font-semibold">
                        Everything you need to know about the Sendry architecture, performance, and scaling limits.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => {
                        const isOpen = !!faqOpen[i];
                        return (
                            <div key={i} className="border border-[#EBEBEB] bg-white rounded-2xl overflow-hidden transition-all shadow-sm">
                                <button 
                                    onClick={() => toggleFaq(i)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-[#222026] hover:bg-slate-50/50 focus:outline-none"
                                >
                                    <span>{faq.question}</span>
                                    {isOpen ? <ChevronDown className="w-5 h-5 text-[#222026] rotate-180 transition-transform duration-200" /> : <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200" />}
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/20 font-medium">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-t from-white via-[#A7E46A]/10 to-[#A8DFF8]/10 py-24 relative z-10 border-t border-[#EBEBEB]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#222026] mb-6 leading-tight">
                        Ready to monitor your APIs like a pro?
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto mb-10 text-base sm:text-lg font-semibold">
                        Set up Sendry today. Run on Docker, configure your API keys, and start tracking request latency under 5 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#222026] hover:bg-slate-800 text-white font-bold rounded-full shadow-lg shadow-slate-200 transition-all duration-200">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#222026] hover:bg-slate-800 text-white font-bold rounded-full shadow-lg shadow-slate-200 transition-all duration-200">
                                Get Started Free
                            </Link>
                        )}
                        <Link to="/docs" className="w-full sm:w-auto px-8 py-4 bg-white border border-[#EBEBEB] hover:bg-slate-50 text-[#222026] font-bold rounded-full transition-all duration-200">
                            View Documentation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#EBEBEB] bg-white py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded bg-[#222026] flex items-center justify-center">
                                <Activity className="w-4 h-4 text-[#A7E46A]" />
                            </div>
                            <span className="font-bold text-[#222026] text-lg">Sendry</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Decoupled, event-driven API analytics built for developers who care about sub-millisecond efficiency.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs text-[#222026] uppercase tracking-wider mb-4">Product</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#features" className="text-slate-500 hover:text-[#222026] font-semibold">Features</a></li>
                            <li><a href="#how-it-works" className="text-slate-500 hover:text-[#222026] font-semibold">Integrations</a></li>
                            <li><a href="#faq" className="text-slate-500 hover:text-[#222026] font-semibold">FAQ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs text-[#222026] uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2 text-xs">
                            <li><Link to="/docs" className="text-slate-500 hover:text-[#222026] font-semibold">Setup Docs</Link></li>
                            <li><Link to="/docs" className="text-slate-500 hover:text-[#222026] font-semibold">API Specifications</Link></li>
                            <li><a href="https://github.com/sultanxdev/sendry" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-[#222026] font-semibold flex items-center gap-1">GitHub repository <ExternalLink className="w-3 h-3" /></a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs text-[#222026] uppercase tracking-wider mb-4">License</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2 font-semibold">
                            Sendry is open source, licensed under MIT. Feel free to clone, distribute, or host yourself.
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">© {new Date().getFullYear()} Sendry Platform. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
