import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Activity, ChevronRight, Terminal, BookOpen, 
    Copy, Check, ArrowLeft, Menu, X, Shield, 
    Database, Settings, AlertTriangle, Play
} from 'lucide-react';

export function DocsPage({ isAuthenticated }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sidebarSections = [
        {
            title: "Getting Started",
            items: [
                { id: "overview", label: "Overview & Architecture" },
                { id: "quickstart", label: "Quick Start Guide" }
            ]
        },
        {
            title: "SDK Integration",
            items: [
                { id: "middleware", label: "Express Middleware" },
                { id: "configs", label: "Configuration Options" }
            ]
        },
        {
            title: "Core Mechanics",
            items: [
                { id: "resilience", label: "Circuit Breaker & Retries" },
                { id: "queues", label: "RabbitMQ & DLQ" },
                { id: "environments", label: "Env Variables Reference" }
            ]
        }
    ];

    const codes = {
        npmInstall: `npm install axios`,
        middlewareCode: `// monitoring.js - Save this inside your Express project
const axios = require('axios');

module.exports = function monitoringMiddleware(options = {}) {
  const apiKey = options.apiKey || process.env.MONITORING_API_KEY;
  const endpoint = options.endpoint || process.env.MONITORING_ENDPOINT || 'http://localhost:5000/api/hit';
  const serviceName = options.serviceName || process.env.SERVICE_NAME || 'my-express-service';
  const enableLogging = options.enableLogging !== false;
  const timeoutMs = options.timeout || 3000;

  return function (req, res, next) {
    const start = process.hrtime();

    // Attach listeners to response finished event
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6);

      // Raw API hit data to queue
      const payload = {
        serviceName,
        endpoint: req.route ? req.route.path : req.path,
        method: req.method,
        statusCode: res.statusCode,
        latencyMs: parseFloat(latencyMs.toFixed(2))
      };

      if (!apiKey) {
        if (enableLogging) console.warn('📊 [Sendry SDK] Missing MONITORING_API_KEY. Ingest skipped.');
        return;
      }

      // Fire-and-forget: do NOT block the Express call stack
      axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        timeout: timeoutMs
      }).catch(err => {
        if (enableLogging) {
          console.error('📊 [Sendry SDK] Ingestion failure:', err.message);
        }
      });
    });

    next();
  };
};`,
        expressUsage: `const express = require('express');
const monitoringMiddleware = require('./monitoring');

const app = express();

// Apply globally (or to specific routes)
app.use(monitoringMiddleware({
  serviceName: 'user-service',
  enableLogging: process.env.NODE_ENV !== 'production'
}));

app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }] });
});

app.listen(3000);`,
        envVars: `# Server Port
PORT=5000

# MongoDB URI (Raw Events)
MONGO_URI=mongodb://localhost:27017/api_monitoring

# PostgreSQL Connection (Aggregated Metrics)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=api_monitoring
PG_USER=postgres
PG_PASSWORD=postgres

# RabbitMQ AMQP Broker URL
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=api_hits`
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#EBEBEB]/20 to-[#A7E46A]/5 text-[#222026] font-sans selection:bg-[#A7E46A] selection:text-[#222026] flex flex-col relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-[#A7E46A]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-[#A8DFF8]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top navigation header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EBEBEB] h-16 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-9 h-9 rounded-xl bg-[#222026] flex items-center justify-center shadow-md">
                                <Activity className="w-5 h-5 text-[#A7E46A]" />
                            </div>
                            <span className="font-bold text-lg text-[#222026]">Sendry Docs</span>
                        </div>
                        <span className="hidden sm:inline text-xs text-[#222026]/70 px-2.5 py-0.5 rounded-full border border-[#EBEBEB] bg-slate-50 font-bold">v1.0.0</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-[#222026] transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Home Page
                        </Link>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="px-5 py-2 text-xs font-bold text-white bg-[#222026] hover:bg-slate-800 rounded-full transition-colors shadow-md">
                                Dashboard
                            </Link>
                        ) : (
                            <Link to="/login" className="px-5 py-2 text-xs font-bold text-[#222026] bg-white border border-[#EBEBEB] hover:bg-slate-50 rounded-full transition-colors">
                                Sign In
                            </Link>
                        )}
                        <button 
                            className="md:hidden p-1.5 rounded-xl border border-[#EBEBEB] text-slate-500 hover:text-[#222026] hover:bg-slate-100"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Layout Wrapper */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex relative z-10">
                
                {/* Sidebar Navigation */}
                <aside className={`w-64 shrink-0 border-r border-[#EBEBEB]/80 pr-6 pt-8 pb-12 fixed md:sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-30 bg-white md:bg-transparent transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} left-0 px-4 md:px-0`}>
                    <nav className="space-y-8">
                        {sidebarSections.map((sect, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3">{sect.title}</h4>
                                <ul className="space-y-1">
                                    {sect.items.map((item) => {
                                        const isActive = activeSection === item.id;
                                        return (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => {
                                                        setActiveSection(item.id);
                                                        setSidebarOpen(false);
                                                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${isActive ? 'bg-[#222026] text-white' : 'text-slate-500 hover:text-[#222026] hover:bg-[#EBEBEB]/30'}`}
                                                >
                                                    <span>{item.label}</span>
                                                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Documentation Pane */}
                <main className="flex-1 min-w-0 pt-8 pb-24 md:pl-8">
                    
                    {/* OVERVIEW SECTION */}
                    <section id="overview" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <BookOpen className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Architecture Guide</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-[#222026] tracking-tight mb-4">
                            Platform Overview & System Design
                        </h1>
                        <p className="text-slate-500 text-base leading-relaxed mb-6 font-semibold">
                            Sendry is a self-hostable SaaS engine built to capture, process, and visualize your application's API traffic without introducing latency delays or downstream locks. The platform's resilience is driven by an **asynchronous event pipeline**.
                        </p>

                        {/* Flowchart diagram mockup */}
                        <div className="my-8 border border-[#EBEBEB] bg-white rounded-3xl p-6 shadow-md">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 text-center">Decoupled Ingest Pipeline Flow</h4>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <div className="border border-[#EBEBEB] bg-slate-50 p-4 rounded-2xl text-center shrink-0 w-44">
                                    <div className="text-xs text-[#222026] font-bold">Client Express App</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Sends API Hit (Async)</div>
                                </div>
                                <div className="text-slate-400 font-bold text-sm rotate-90 md:rotate-0">→</div>
                                <div className="border border-[#A7E46A]/45 bg-[#A7E46A]/10 p-4 rounded-2xl text-center shrink-0 w-44 relative">
                                    <div className="text-xs text-slate-800 font-bold">Ingestion API Server</div>
                                    <div className="text-[10px] text-slate-650 mt-1">Returns 202 Accepted</div>
                                </div>
                                <div className="text-slate-400 font-bold text-sm rotate-90 md:rotate-0">→</div>
                                <div className="border border-[#EBEBEB] bg-slate-50 p-4 rounded-2xl text-center shrink-0 w-44">
                                    <div className="text-xs text-[#222026] font-bold">RabbitMQ Queue</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Durable Buffering</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center my-4">
                                <div className="text-slate-400 font-bold text-sm rotate-90">→</div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <div className="border border-[#EBEBEB] bg-slate-50 p-4 rounded-2xl text-center shrink-0 w-44">
                                    <div className="text-xs text-[#222026] font-bold">MongoDB Database</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Raw logs (30-day TTL)</div>
                                </div>
                                <div className="text-slate-400 font-bold text-sm rotate-90 md:rotate-180">→</div>
                                <div className="border border-[#A8DFF8]/45 bg-[#A8DFF8]/10 p-4 rounded-2xl text-center shrink-0 w-44">
                                    <div className="text-xs text-slate-800 font-bold">Queue Consumer</div>
                                    <div className="text-[10px] text-slate-650 mt-1">Standalone process</div>
                                </div>
                                <div className="text-slate-400 font-bold text-sm rotate-90 md:rotate-180">→</div>
                                <div className="border border-[#EBEBEB] bg-slate-50 p-4 rounded-2xl text-center shrink-0 w-44">
                                    <div className="text-xs text-[#222026] font-bold">PostgreSQL DB</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Aggregated Hourly Stats</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="border border-[#EBEBEB] bg-white rounded-3xl p-6 shadow-sm">
                                <h3 className="font-black text-[#222026] text-base mb-2">Ingestion Endpoint</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    `POST http://localhost:5000/api/hit` is the core ingest route. It validates incoming headers, verifies client API keys, registers the client IP, and queues the payload into RabbitMQ. If successful, it responds immediately with a `202 Accepted` response.
                                </p>
                            </div>
                            <div className="border border-[#EBEBEB] bg-white rounded-3xl p-6 shadow-sm">
                                <h3 className="font-black text-[#222026] text-base mb-2">Background Worker</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    A separate, lightweight background Node process subscribes to the RabbitMQ queue. It implements deduplication checking via an in-memory cache and stores records to both databases with a two-tier criticality safety scheme.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* QUICK START SECTION */}
                    <section id="quickstart" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Play className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Quick Start Guide</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            Getting Up and Running
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            To host the monitoring stack on your local machine, follow these step-by-step instructions.
                        </p>

                        <div className="space-y-6">
                            <div className="relative pl-10">
                                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-xs font-bold text-slate-800">1</div>
                                <h4 className="font-bold text-sm text-[#222026]">Start Local Infrastructure with Docker</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3 font-semibold">Run database and message queue containers locally inside the `server/` directory:</p>
                                <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 shadow-inner">
                                    <code>cd server && docker-compose up -d</code>
                                    <button 
                                        onClick={() => copyToClipboard('cd server && docker-compose up -d', 'docker')}
                                        className="absolute right-3 top-3.5 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-350 transition-colors"
                                    >
                                        {copiedId === 'docker' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative pl-10">
                                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-xs font-bold text-slate-800">2</div>
                                <h4 className="font-bold text-sm text-[#222026]">Launch Backend and Consumer processes</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3 font-semibold">Install npm modules and boot the API server and consumer workers:</p>
                                <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 mb-3 shadow-inner">
                                    <code>npm install && npm run dev</code>
                                    <button 
                                        onClick={() => copyToClipboard('npm install && npm run dev', 'serverDev')}
                                        className="absolute right-3 top-3.5 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                                    >
                                        {copiedId === 'serverDev' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 shadow-inner">
                                    <code>node src/services/processor/consumer.js</code>
                                    <button 
                                        onClick={() => copyToClipboard('node src/services/processor/consumer.js', 'consumerDev')}
                                        className="absolute right-3 top-3.5 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                                    >
                                        {copiedId === 'consumerDev' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative pl-10">
                                <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-[#A7E46A]/20 border border-[#A7E46A]/40 flex items-center justify-center text-xs font-bold text-slate-800">3</div>
                                <h4 className="font-bold text-sm text-[#222026]">Onboard Administrative Account</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3 font-semibold">Make a POST query to register your first admin user. Once created, login to the React dashboard on port `5173`, create a client, and generate your first API Key.</p>
                            </div>
                        </div>
                    </section>

                    {/* SDK INTEGRATION SECTION */}
                    <section id="middleware" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Terminal className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Developer SDK</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            SDK Middleware Integration
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            To send traffic logs automatically to Sendry, drop this lightweight middleware into your Node.js or Express.js server:
                        </p>

                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Step 1: Install Axios in your application</h4>
                        <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 mb-6 shadow-inner">
                            <code>{codes.npmInstall}</code>
                            <button 
                                onClick={() => copyToClipboard(codes.npmInstall, 'npm')}
                                className="absolute right-3 top-3.5 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                            >
                                {copiedId === 'npm' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Step 2: Add middleware code to a `monitoring.js` helper file</h4>
                        <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 mb-6 max-h-96 overflow-y-auto shadow-inner">
                            <pre><code>{codes.middlewareCode}</code></pre>
                            <button 
                                onClick={() => copyToClipboard(codes.middlewareCode, 'middleware')}
                                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                            >
                                {copiedId === 'middleware' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">Step 3: Register helper inside your server startup routing file</h4>
                        <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 mb-6 shadow-inner">
                            <pre><code>{codes.expressUsage}</code></pre>
                            <button 
                                onClick={() => copyToClipboard(codes.expressUsage, 'express')}
                                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                            >
                                {copiedId === 'express' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </section>

                    {/* CONFIGS REFERENCE SECTION */}
                    <section id="configs" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Settings className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Configuration Parameters</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            SDK Initialization Properties
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            The `monitoringMiddleware` helper function supports the following parameters in its config block:
                        </p>

                        <div className="overflow-x-auto border border-[#EBEBEB] rounded-2xl bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-[#EBEBEB] text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="text-left font-bold text-[#222026]">
                                        <th className="px-4 py-3">Variable</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Default Value</th>
                                        <th className="px-4 py-3">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EBEBEB] text-slate-500 font-semibold">
                                    <tr>
                                        <td className="px-4 py-3 font-mono text-[#222026] font-bold">serviceName</td>
                                        <td className="px-4 py-3">String</td>
                                        <td className="px-4 py-3 font-mono text-slate-400">process.env.SERVICE_NAME</td>
                                        <td className="px-4 py-3">Identifier of the app instance, e.g. `billing-service`.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-mono text-[#222026] font-bold">apiKey</td>
                                        <td className="px-4 py-3">String</td>
                                        <td className="px-4 py-3 font-mono text-slate-400">process.env.MONITORING_API_KEY</td>
                                        <td className="px-4 py-3">Authorization token generated inside the platform panel.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-mono text-[#222026] font-bold">endpoint</td>
                                        <td className="px-4 py-3">String</td>
                                        <td className="px-4 py-3 font-mono text-slate-400">http://localhost:5000/api/hit</td>
                                        <td className="px-4 py-3">Target endpoint hosting the Sendry Ingest API route.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-mono text-[#222026] font-bold">timeout</td>
                                        <td className="px-4 py-3">Number</td>
                                        <td className="px-4 py-3 font-mono text-slate-400">3000</td>
                                        <td className="px-4 py-3">Timeout in milliseconds for the background Axios log post.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-mono text-[#222026] font-bold">enableLogging</td>
                                        <td className="px-4 py-3">Boolean</td>
                                        <td className="px-4 py-3 font-mono text-slate-400">true</td>
                                        <td className="px-4 py-3">Controls whether logging warnings are printed to standard output.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* RESILIENCE SECTION */}
                    <section id="resilience" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Shield className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>System Reliability</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            Active Circuit Breaking & Retries
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            Sendry prevents cascade server crashes through double-sided circuit breakers:
                        </p>

                        <div className="space-y-6 text-sm">
                            <div className="border border-[#EBEBEB] bg-white rounded-3xl p-6 shadow-sm">
                                <h4 className="font-bold text-[#222026] mb-2 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#A8DFF8]"></span>
                                    1. Ingestion / Producer Circuit Breaker
                                </h4>
                                <p className="text-slate-500 leading-relaxed font-semibold">
                                    If the RabbitMQ server experiences network dropouts or goes offline, the ingest endpoint's circuit breaker opens. Instead of blocking Express event loop threads or piling request memory heaps, it immediately fails open and rejects ingest posts with a `503 Service Unavailable` response.
                                </p>
                            </div>

                            <div className="border border-[#EBEBEB] bg-white rounded-3xl p-6 shadow-sm">
                                <h4 className="font-bold text-[#222026] mb-2 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#A7E46A]"></span>
                                    2. Consumer Retry Strategy (Exponential Backoff + Jitter)
                                </h4>
                                <p className="text-slate-500 leading-relaxed font-semibold">
                                    If PostgreSQL or MongoDB drops off briefly, the queue consumer does not drop the message. It retries processing using an exponential delay scale (`delay = min(baseDelay * 2^attempt, maxDelay)`) combined with a random `30% jitter factor`. This prevents a storming-herd effect when DB connections recover.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* QUEUES SECTION */}
                    <section id="queues" className="scroll-mt-24 mb-16 border-b border-[#EBEBEB] pb-12">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Database className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Queue Structures</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            RabbitMQ Buffers & Dead-Letter Queues (DLQ)
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            Messages are stored in the queue with a <code className="bg-[#222026] px-2 py-0.5 rounded-lg text-xs font-mono text-[#A7E46A]">{"{ durable: true }"}</code> parameter, ensuring they survive broker restarts.
                        </p>

                        <div className="bg-[#A8DFF8]/10 border border-[#A8DFF8]/30 rounded-3xl p-6 flex items-start gap-4 mb-6">
                            <AlertTriangle className="w-6 h-6 text-slate-700 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                <h4 className="font-bold text-[#222026] text-sm">Dead-Letter Queue routing</h4>
                                <p className="text-xs text-slate-650 leading-relaxed mt-1 font-semibold">
                                    If a message has a malformed format (fails Zod schema validation) or fails the maximum retry threshold (3 attempts), it is routed to the Dead-Letter Queue (`api_hits.dlq`) with headers detailing the crash timestamp, origin queue, and the exact error description. This isolates toxic payloads without blocking healthy traffic.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ENV VARIABLES SECTION */}
                    <section id="environments" className="scroll-mt-24 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs tracking-wider uppercase mb-3">
                            <Settings className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Platform Environment Config</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#222026] tracking-tight mb-4">
                            Environment Variables Reference
                        </h2>
                        
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-semibold">
                            Rename `.env.example` to `.env` inside the `server/` directory and configure the variables accordingly:
                        </p>

                        <div className="bg-[#222026] border border-[#EBEBEB]/10 rounded-2xl p-4 font-mono text-xs relative group text-slate-200 shadow-inner">
                            <pre><code>{codes.envVars}</code></pre>
                            <button 
                                onClick={() => copyToClipboard(codes.envVars, 'envs')}
                                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-355 transition-colors"
                            >
                                {copiedId === 'envs' ? <Check className="w-4 h-4 text-[#A7E46A]" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default DocsPage;
