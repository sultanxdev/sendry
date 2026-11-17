import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge } from '../components/ui';
import { ThemeSelector } from '../components/ThemeSelector';
import { authApi, clientApi } from '../api/api';
import { useToast } from '../contexts/ToastContext';
import { 
    Palette, Key, Copy, Check, Plus, Shield, 
    User, Terminal, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';

export function SettingsPage() {
    const { addToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [loadingKeys, setLoadingKeys] = useState(true);
    const [creatingKey, setCreatingKey] = useState(false);
    const [keyName, setKeyName] = useState('');
    const [environment, setEnvironment] = useState('production');
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [copiedKeyId, setCopiedKeyId] = useState(null);
    const [copiedSnippet, setCopiedSnippet] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userProfile = await authApi.getProfile();
            setProfile(userProfile?.data || null);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }

        try {
            setLoadingKeys(true);
            const keysRes = await clientApi.getMyApiKeys();
            setApiKeys(keysRes?.data || []);
        } catch (err) {
            console.error('Failed to load API keys:', err);
        } finally {
            setLoadingKeys(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!keyName.trim()) {
            addToast('Please enter a name for your API key', 'error');
            return;
        }

        try {
            setCreatingKey(true);
            const res = await clientApi.createMyApiKey({
                name: keyName.trim(),
                environment
            });

            if (res?.success) {
                setNewlyCreatedKey(res.data);
                addToast('API key generated successfully!', 'success');
                setKeyName('');
                loadData();
            } else {
                addToast(res?.message || 'Failed to create API key', 'error');
            }
        } catch (err) {
            addToast(err?.response?.data?.message || 'Failed to create API key', 'error');
        } finally {
            setCreatingKey(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedKeyId(id);
        addToast('API key copied to clipboard', 'success');
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const activeApiKey = newlyCreatedKey?.keyValue || (apiKeys.length > 0 ? 'your-api-key-here' : 'YOUR_API_KEY');

    const middlewareSnippet = `// Install axios: npm install axios
const axios = require('axios');

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const latencyMs = diff[0] * 1e3 + diff[1] * 1e-6;

    axios.post('http://localhost:5000/api/hit', {
      serviceName: 'my-express-app',
      endpoint: req.route ? req.route.path : req.path,
      method: req.method,
      statusCode: res.statusCode,
      latencyMs: parseFloat(latencyMs.toFixed(2))
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${activeApiKey}'
      },
      timeout: 3000
    }).catch(() => {}); // Non-blocking fire-and-forget
  });
  next();
});`;

    const copySnippetToClipboard = () => {
        navigator.clipboard.writeText(middlewareSnippet);
        setCopiedSnippet(true);
        addToast('Middleware code copied to clipboard!', 'success');
        setTimeout(() => setCopiedSnippet(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            <div className="flex flex-col gap-0.5">
                <h2 className="text-2xl font-black text-[#222026] tracking-tight m-0">Settings</h2>
                <p className="text-sm text-slate-500 font-semibold m-0">
                    Manage your credentials, team profile, and monitoring integration
                </p>
            </div>

            {/* Account Profile Section */}
            {profile && (
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-[#1FD27A]" aria-hidden="true" />
                            <CardTitle>Account & Organization</CardTitle>
                        </div>
                        <CardDescription>Details about your current logged-in identity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Username</span>
                                <span className="text-base font-bold text-slate-900">{profile.username}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</span>
                                <span className="text-base font-bold text-slate-900">{profile.email}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Role</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="font-mono text-xs uppercase bg-emerald-50 text-emerald-700 border-emerald-200">
                                        {profile.role?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* API Keys Management Section */}
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#1FD27A]" aria-hidden="true" />
                            <CardTitle>Sendry API Keys</CardTitle>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={loadData}
                            className="gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </Button>
                    </div>
                    <CardDescription>
                        Use these keys in your Express SDK or middleware via the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">x-api-key</code> HTTP header.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    {/* Newly Created Key Alert Banner */}
                    {newlyCreatedKey && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>Save your new API key now! It won't be shown again in full.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                    readOnly 
                                    value={newlyCreatedKey.keyValue}
                                    className="font-mono text-xs bg-white text-emerald-950 font-bold select-all"
                                />
                                <Button 
                                    size="sm" 
                                    onClick={() => copyToClipboard(newlyCreatedKey.keyValue, 'new-key')}
                                    className="bg-[#1FD27A] hover:bg-[#16B566] text-[#0E1512] font-bold shrink-0 gap-1"
                                >
                                    {copiedKeyId === 'new-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedKeyId === 'new-key' ? 'Copied' : 'Copy'}</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Create New Key Form */}
                    <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3 items-end p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                Key Name / Application
                            </label>
                            <Input 
                                placeholder="e.g. Production Backend, Auth Service"
                                value={keyName}
                                onChange={(e) => setKeyName(e.target.value)}
                                className="bg-white"
                                disabled={creatingKey}
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">
                                Environment
                            </label>
                            <select
                                value={environment}
                                onChange={(e) => setEnvironment(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1FD27A]"
                                disabled={creatingKey}
                            >
                                <option value="production">Production</option>
                                <option value="staging">Staging</option>
                                <option value="development">Development</option>
                                <option value="testing">Testing</option>
                            </select>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={creatingKey || !keyName.trim()}
                            className="bg-[#0E1512] hover:bg-slate-800 text-white font-bold h-10 px-4 shrink-0 gap-1.5 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{creatingKey ? 'Creating…' : 'Generate Key'}</span>
                        </Button>
                    </form>

                    {/* Existing Keys Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3 px-3">Name</th>
                                    <th className="pb-3 px-3">Environment</th>
                                    <th className="pb-3 px-3">Key ID</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingKeys ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold">
                                            Loading API keys…
                                        </td>
                                    </tr>
                                ) : apiKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">
                                            No API keys created yet. Generate your first key above to begin monitoring!
                                        </td>
                                    </tr>
                                ) : (
                                    apiKeys.map((k) => (
                                        <tr key={k._id || k.keyId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-3 font-bold text-slate-800">
                                                {k.name}
                                            </td>
                                            <td className="py-3 px-3">
                                                <Badge 
                                                    variant="secondary" 
                                                    className="font-mono text-xs uppercase"
                                                >
                                                    {k.environment || 'production'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 font-mono text-xs text-slate-500">
                                                {k.keyId ? `${k.keyId.slice(0, 12)}…` : '—'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-xs text-slate-400">
                                                {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : 'Today'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Quickstart Integration Code Snippet */}
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-[#1FD27A]" aria-hidden="true" />
                            <CardTitle>Express Middleware Integration</CardTitle>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copySnippetToClipboard}
                            className="gap-1.5 text-xs font-bold"
                        >
                            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSnippet ? 'Copied Code' : 'Copy Middleware Code'}</span>
                        </Button>
                    </div>
                    <CardDescription>
                        Copy and paste this snippet directly into your Express application to start tracking all incoming hits with sub-millisecond overhead.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="p-4 rounded-xl bg-[#0E1512] text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{middlewareSnippet}</code>
                    </pre>
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#1FD27A]" aria-hidden="true" />
                        <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemeSelector />
                </CardContent>
            </Card>
        </div>
    );
}

export default SettingsPage;
