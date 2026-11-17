import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

export function LandingPage({ isAuthenticated, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const platformTabs = [
    {
      id: 'tab-0',
      name: 'Ingest API',
      sub: 'Key check, then 202',
      tc: '#1FD27A',
      tcur: '#1FD27A',
      tint: '#E6F7EE',
      kick: 'INGEST API',
      h3: 'An endpoint that answers before it works',
      desc: 'POST /api/hit checks the x-api-key header, publishes to RabbitMQ and returns 202 Accepted.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
      ),
      content: (
        <div className="mock">
          <div className="mc mrow">
            <div className="grow">
              <b>x-api-key validation</b>
              <small>Scoped per client, optional IP allowlist, 365-day expiry</small>
            </div>
            <span className="pill live">On</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Publish to RabbitMQ</b>
              <small>Durable queue api_hits</small>
            </div>
            <span className="pill">queued</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>202 Accepted</b>
              <small>Returns an eventId</small>
            </div>
            <span className="pill live">~2 ms</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Rate limiting</b>
              <small>Window and maximum are configurable</small>
            </div>
            <span className="pill">1,000 / 15 min</span>
          </div>
        </div>
      ),
      foot: ['~2 ms to 202', 'Scoped API keys', 'Webhook alerts planned'],
    },
    {
      id: 'tab-1',
      name: 'Reliability',
      sub: 'Breaker, retry, dead letters',
      tc: '#FFD97A',
      tcur: '#FFD97A',
      tint: '#FFF6DD',
      kick: 'RELIABILITY',
      h3: 'Four safeguards between the queue and your data',
      desc: 'Each one handles a different failure, so no single outage takes the pipeline down.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      content: (
        <div className="mock">
          <div className="mc mrow">
            <div className="grow">
              <b>Idempotency guard</b>
              <small>Skips duplicate event IDs, capped at 100K entries</small>
            </div>
            <span className="pill live">On</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Circuit breaker</b>
              <small>Opens after 5 failures, 30 s cooldown, 3 probes</small>
            </div>
            <span className="pill live">Closed</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Retry engine</b>
              <small>1 s, 2 s, 4 s with ±30% jitter</small>
            </div>
            <span className="pill">3 tries</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Dead-letter queue</b>
              <small>api_hits.dlq, nothing is discarded</small>
            </div>
            <span className="pill">Empty</span>
          </div>
        </div>
      ),
      foot: ['In-memory state today', 'Redis-backed state planned', 'Run one consumer'],
    },
    {
      id: 'tab-2',
      name: 'Storage',
      sub: 'MongoDB and PostgreSQL',
      tc: '#B9A6FF',
      tcur: '#B9A6FF',
      tint: '#F3EFFF',
      kick: 'STORAGE',
      h3: 'Raw logs and metrics, each in the right place',
      desc: 'The consumer writes to both. The MongoDB write must succeed, the PostgreSQL write is best-effort.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      ),
      content: (
        <div className="mock cols2">
          <div className="mc">
            <div className="col-h">Raw events · MongoDB</div>
            <div className="mrow" style={{ marginBottom: '10px' }}>
              <div className="grow">
                <b>Full hit payloads</b>
                <small>endpoint, method, status, latency</small>
              </div>
              <span className="pill">TTL 30 d</span>
            </div>
            <div className="mrow">
              <div className="grow">
                <b>Unique eventId index</b>
                <small>backup for duplicate delivery</small>
              </div>
              <span className="pill live">On</span>
            </div>
          </div>
          <div className="mc">
            <div className="col-h">Hourly metrics · PostgreSQL</div>
            <div className="bars" aria-hidden="true">
              <i style={{ height: '30%' }}></i>
              <i style={{ height: '48%' }}></i>
              <i style={{ height: '42%' }}></i>
              <i style={{ height: '70%' }}></i>
              <i style={{ height: '60%' }}></i>
              <i style={{ height: '92%' }}></i>
            </div>
            <div className="mrow" style={{ marginTop: '12px' }}>
              <span className="pill live">UPSERT</span>
              <span className="pill">1 h buckets</span>
            </div>
          </div>
        </div>
      ),
      foot: ['Eventual consistency', 'A chart reads about 24 rows', 'TimescaleDB planned'],
    },
    {
      id: 'tab-3',
      name: 'Security',
      sub: 'JWT, roles, API keys',
      tc: '#FF9E7A',
      tcur: '#FF9E7A',
      tint: '#FFF0E9',
      kick: 'SECURITY',
      h3: 'Access that is scoped by client and role',
      desc: 'Dashboard users sign in with a JWT in an HTTP-only cookie. Hits are ingested with API keys.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </svg>
      ),
      content: (
        <div className="mock">
          <div className="mc mrow">
            <div className="grow">
              <b>Roles</b>
              <small>super_admin, client_admin, client_viewer</small>
            </div>
            <span className="pill">3 roles</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>API keys</b>
              <small>production, staging, development, testing</small>
            </div>
            <span className="pill live">scoped</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Dashboard login</b>
              <small>JWT in an HTTP-only cookie, 24 h</small>
            </div>
            <span className="pill live">On</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Passwords</b>
              <small>Hashed with bcrypt</small>
            </div>
            <span className="pill live">On</span>
          </div>
        </div>
      ),
      foot: ['IP allowlist per key', 'Rate limiting', 'Refresh tokens planned'],
    },
    {
      id: 'tab-4',
      name: 'Dashboard',
      sub: 'Overview and settings',
      tc: '#8FBBFF',
      tcur: '#8FBBFF',
      tint: '#EAF2FF',
      kick: 'DASHBOARD',
      h3: 'Everything you need on one screen',
      desc: 'React 18 with TanStack Query. It refreshes on its own, and you can also refresh by hand.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      ),
      content: (
        <div className="mock">
          <div className="mc mrow">
            <div className="grow">
              <b>Overview</b>
              <small>Six KPIs, traffic summary and status codes</small>
            </div>
            <span className="pill live">Built in</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Top endpoints</b>
              <small>Sortable by hits, latency and errors</small>
            </div>
            <span className="pill live">Built in</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Settings</b>
              <small>Clients and API keys</small>
            </div>
            <span className="pill live">Built in</span>
          </div>
          <div className="mc mrow">
            <div className="grow">
              <b>Themes</b>
              <small>Light, dark or auto</small>
            </div>
            <span className="pill live">Built in</span>
          </div>
        </div>
      ),
      foot: ['Polling today', 'Live updates (SSE) planned', 'Lazy-loaded pages'],
    },
  ];

  const currentTab = platformTabs[activeTab];

  const handleKeyDown = (e, index) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (index + 1) % platformTabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (index - 1 + platformTabs.length) % platformTabs.length;
    }
    if (targetIndex !== -1) {
      e.preventDefault();
      setActiveTab(targetIndex);
      const targetBtn = document.getElementById(`tab-${targetIndex}`);
      targetBtn?.focus();
    }
  };

  return (
    <div className="landing-container">
      {/* Top Header */}
      <header className="top">
        <div className="wrap top-i">
          <a href="#top" className="logo" aria-label="Sendry home">
            <span className="mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </span>
            Sendry
          </a>
          <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`} id="nav" aria-label="Main">
            <a href="#how" onClick={() => setMobileMenuOpen(false)}>Pipeline</a>
            <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
            <a href="#reliability" onClick={() => setMobileMenuOpen(false)}>Reliability</a>
            <a href="#hosting" onClick={() => setMobileMenuOpen(false)}>Hosting</a>
          </nav>
          <div className="status">
            <span className="dot"></span>Open source · MIT
          </div>
          <div className="top-r">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="login font-bold">Dashboard</Link>
                <a href="https://github.com/sultanxdev/sendry" target="_blank" rel="noreferrer" className="btn btn-o btn-sm">GitHub</a>
                <button onClick={onLogout} className="btn btn-k btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="login">Log in</Link>
                <a href="https://github.com/sultanxdev/sendry" target="_blank" rel="noreferrer" className="btn btn-o btn-sm">GitHub</a>
                <Link to="/register" className="btn btn-k btn-sm">Start free</Link>
              </>
            )}
          </div>
          <button
            className="burger"
            id="burger"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-l">
                <div className="hero-top">
                  <div className="eyebrow">
                    <span className="dot"></span>Express · RabbitMQ · MongoDB · PostgreSQL
                  </div>
                  <h1>Every API hit tracked.<br />Your API <span className="bubble">never waits.</span></h1>
                </div>
                <div className="hero-b">
                  <div>
                    <p className="lead">Sendry accepts each hit in about 2 ms, queues it in RabbitMQ and stores it in the background. Add one Express middleware and your dashboard fills with latency, errors and traffic.</p>
                    <div className="row">
                      {isAuthenticated ? (
                        <Link to="/dashboard" className="btn btn-k">Go to Dashboard</Link>
                      ) : (
                        <Link to="/register" className="btn btn-k">Start free</Link>
                      )}
                      <a href="#platform" className="btn btn-o">See it working</a>
                    </div>
                    <p className="fine">Open source. Node.js 18+. Docker Compose included.</p>
                  </div>
                </div>
              </div>

              {/* Flow SVG Diagram with Animated Pulses */}
              <div className="flow" role="img" aria-label="Diagram: your apps send hits to the Sendry ingest API, which queues them in RabbitMQ for the consumer, which writes to MongoDB and PostgreSQL">
                <svg viewBox="0 0 440 460" aria-hidden="true">
                  <text className="fl-t" x="24" y="30">YOUR APPS</text>
                  <text className="fl-t live" x="416" y="30" textAnchor="end">● LIVE</text>
                  <rect x="28" y="46" width="108" height="44" rx="12" fill="#fff" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-n" x="82" y="73" textAnchor="middle">AUTH</text>
                  <rect x="166" y="46" width="108" height="44" rx="12" fill="#fff" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-n" x="220" y="73" textAnchor="middle">PAYMENTS</text>
                  <rect x="304" y="46" width="108" height="44" rx="12" fill="#fff" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-n" x="358" y="73" textAnchor="middle">BLOG</text>
                  <path className="base" d="M82 90V122H220V150" />
                  <path className="pulse" pathLength={100} d="M82 90V122H220V150" style={{ stroke: '#1FD27A' }} />
                  <path className="base" d="M220 90V150" />
                  <path className="pulse" pathLength={100} d="M220 90V150" style={{ stroke: '#FF8A5B' }} />
                  <path className="base" d="M358 90V122H220V150" />
                  <path className="pulse" pathLength={100} d="M358 90V122H220V150" style={{ stroke: '#4C8DF0' }} />
                  <rect x="24" y="150" width="392" height="286" rx="16" fill="#fff" fillOpacity=".75" stroke="#8FA89B" strokeWidth="1.5" strokeDasharray="5 5" />
                  <rect x="40" y="142" width="70" height="16" fill="#fff" />
                  <text className="fl-l" x="48" y="154">SENDRY</text>
                  <rect x="48" y="176" width="40" height="40" rx="11" fill="#D4F5E3" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-g" x="68" y="201" textAnchor="middle">API</text>
                  <text className="fl-n" x="104" y="193">INGEST API</text>
                  <text className="fl-s" x="104" y="209">Key check, then 202</text>
                  <rect x="332" y="184" width="64" height="24" rx="7" fill="#D4F5E3" />
                  <text className="fl-s" x="364" y="200" textAnchor="middle" style={{ fill: '#0B5F37' }}>~2 ms</text>
                  <path className="base" d="M68 216V246" />
                  <path className="pulse" pathLength={100} d="M68 216V246" style={{ stroke: '#1FD27A' }} />
                  <rect x="48" y="246" width="40" height="40" rx="11" fill="#E5DEFF" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-g" x="68" y="271" textAnchor="middle">MQ</text>
                  <text className="fl-n" x="104" y="263">RABBITMQ</text>
                  <text className="fl-s" x="104" y="279">Durable queue</text>
                  <path className="base" d="M68 286V316" />
                  <path className="pulse" pathLength={100} d="M68 286V316" style={{ stroke: '#7C5CFF' }} />
                  <rect x="48" y="316" width="40" height="40" rx="11" fill="#FFE1D6" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-g" x="68" y="341" textAnchor="middle">CS</text>
                  <text className="fl-n" x="104" y="333">CONSUMER</text>
                  <text className="fl-s" x="104" y="349">Idempotency, breaker, retry</text>
                  <path className="base" d="M68 356V386" />
                  <path className="pulse" pathLength={100} d="M68 356V386" style={{ stroke: '#FF8A5B' }} />
                  <rect x="48" y="386" width="40" height="40" rx="11" fill="#D9E6FB" stroke="#0E1512" strokeWidth="1.5" />
                  <text className="fl-g" x="68" y="411" textAnchor="middle">DB</text>
                  <text className="fl-n" x="104" y="403">STORAGE</text>
                  <text className="fl-s" x="104" y="419">MongoDB raw, PostgreSQL hourly</text>
                </svg>
              </div>
            </div>

            {/* Dashboard Console Preview Mockup */}
            <div className="stage">
              <div className="console" role="img" aria-label="Preview of the Sendry dashboard overview with six KPI cards, charts and a top endpoints list (sample data)">
                <div className="c-bar">
                  <i></i><i></i><i></i>
                  <span>sendry.vercel.app/overview · sample data</span>
                </div>
                <div className="c-body" aria-hidden="true">
                  <aside className="c-list">
                    <div className="c-h">
                      <b>Top endpoints</b>
                      <span className="badge dim">18</span>
                    </div>
                    <div className="c-tabs">
                      <span className="on">Hits</span>
                      <span>Latency</span>
                      <span>Errors</span>
                    </div>
                    <div className="ci">
                      <div className="av" style={{ background: '#CFE3F8' }}>GET<span className="cd wa"></span></div>
                      <div className="cm"><b>/api/posts</b><span>14,208 hits</span></div>
                      <div className="cr"><span>12 ms</span></div>
                    </div>
                    <div className="ci">
                      <div className="av" style={{ background: '#DCE7DF' }}>GET<span className="cd wa"></span></div>
                      <div className="cm"><b>/api/session</b><span>11,950 hits</span></div>
                      <div className="cr"><span>34 ms</span></div>
                    </div>
                    <div className="ci on">
                      <div className="av" style={{ background: '#FFD9C2' }}>POST<span className="cd ig"></span></div>
                      <div className="cm"><b>/api/charge</b><span>6,402 hits</span></div>
                      <div className="cr"><span>61 ms</span></div>
                    </div>
                    <div className="ci">
                      <div className="av" style={{ background: '#E3DCFA' }}>POST<span className="cd wa"></span></div>
                      <div className="cm"><b>/api/notify</b><span>3,180 hits</span></div>
                      <div className="cr"><span>28 ms</span></div>
                    </div>
                    <div className="ci">
                      <div className="av" style={{ background: '#FFE9A8' }}>GET<span className="cd wa"></span></div>
                      <div className="cm"><b>/api/users</b><span>2,044 hits</span></div>
                      <div className="cr"><span>19 ms</span></div>
                    </div>
                  </aside>

                  <div className="c-thread">
                    <div className="t-h">
                      <div>
                        <b>Overview</b>
                        <small>Last updated: 12:14:34 PM</small>
                      </div>
                      <div className="sp">
                        <span className="tag tg-ai">Live</span>
                        <span className="tag tg-wa" style={{ margin: 0 }}>Refresh</span>
                      </div>
                    </div>
                    <div className="msgs">
                      <div className="kv kvx">
                        <div><small>Total hits</small><b>48,213</b></div>
                        <div><small>Avg latency</small><b>34.8 ms</b></div>
                        <div><small>Error rate</small><b>0.8%</b></div>
                        <div><small>Success rate</small><b>99.2%</b></div>
                        <div><small>Unique services</small><b>4</b></div>
                        <div><small>Unique endpoints</small><b>18</b></div>
                      </div>
                      <div className="mini">
                        <small>API traffic summary · hits per hour</small>
                        <div className="bars" aria-hidden="true">
                          <i style={{ height: '34%' }}></i>
                          <i style={{ height: '42%' }}></i>
                          <i style={{ height: '38%' }}></i>
                          <i style={{ height: '55%' }}></i>
                          <i style={{ height: '70%' }}></i>
                          <i style={{ height: '62%' }}></i>
                          <i style={{ height: '88%' }}></i>
                          <i style={{ height: '74%' }}></i>
                          <i style={{ height: '58%' }}></i>
                          <i style={{ height: '66%' }}></i>
                          <i style={{ height: '48%' }}></i>
                          <i style={{ height: '52%' }}></i>
                        </div>
                      </div>
                    </div>
                    <div className="suggest">
                      <div>
                        <small>Status code distribution</small>
                        92% of responses are 2xx. 4xx and 5xx together are 4%.
                      </div>
                    </div>
                  </div>

                  <aside className="c-prof">
                    <div className="p-top">
                      <div className="av" style={{ background: '#FFD9C2' }}>PO</div>
                      <div>
                        <b>/api/charge</b>
                        <small>POST · payments-api</small>
                      </div>
                    </div>
                    <div className="chips">
                      <span className="chip hot">2.1% errors</span>
                      <span className="chip">Production</span>
                    </div>
                    <div className="kv">
                      <div><small>Hits</small><b>6,402</b></div>
                      <div><small>Avg latency</small><b>61 ms</b></div>
                    </div>
                    <div className="kv">
                      <div><small>Success rate</small><b>97.9%</b></div>
                      <div><small>Errors</small><b>134</b></div>
                    </div>
                    <div className="sum">
                      <small>Sample data</small>
                      Sort the endpoint list by errors to find the routes that need attention first.
                    </div>
                  </aside>
                </div>
              </div>
            </div>

            {/* Trust Logos */}
            <div className="trust">
              <span>Built on</span>
              <div className="logos">
                <div className="lg"><i></i>Node.js</div>
                <div className="lg"><i></i>Express</div>
                <div className="lg"><i></i>RabbitMQ</div>
                <div className="lg"><i></i>MongoDB</div>
                <div className="lg"><i></i>PostgreSQL</div>
                <div className="lg"><i></i>React</div>
                <div className="lg"><i></i>Docker</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: How It Works */}
        <section className="sec" id="how">
          <div className="wrap row2">
            <div className="gut">
              <i></i>How it works<span className="badge">3</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Your API answers first.<br /><span className="bubble">Sendry catches up.</span></h2>
                <p className="lead">Ingest and processing are separate. The API only validates and queues, so a slow database never slows your users.</p>
              </div>
              <div className="t-grid">
                <ul className="chdef">
                  <li>
                    <span className="ico" style={{ background: '#D4F5E3' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
                      </svg>
                    </span>
                    <div>
                      <b>Ingest API</b>
                      <span>Validates the API key, publishes the event to RabbitMQ and answers 202 Accepted in about 2 ms.</span>
                    </div>
                  </li>
                  <li>
                    <span className="ico" style={{ background: '#FFE1D6' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3l9 5-9 5-9-5z" />
                        <path d="M3 13l9 5 9-5" />
                      </svg>
                    </span>
                    <div>
                      <b>RabbitMQ</b>
                      <span>A durable queue holds events until the consumer is ready, even across restarts.</span>
                    </div>
                  </li>
                  <li>
                    <span className="ico" style={{ background: '#D9E6FB' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <ellipse cx="12" cy="6" rx="8" ry="3" />
                        <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
                        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                      </svg>
                    </span>
                    <div>
                      <b>Two databases</b>
                      <span>Raw events go to MongoDB and expire after 30 days. Hourly metrics go to PostgreSQL, so charts read a few rows.</span>
                    </div>
                  </li>
                </ul>

                <div className="tl">
                  <div className="tl-h">
                    <b>One API hit</b>
                    <span className="tag tg-ai" style={{ margin: 0 }}>5 steps</span>
                  </div>
                  <ol>
                    <li className="wa">
                      <time>1 · Your app</time>
                      <p><span className="tag tg-wa">SDK</span>Response is sent first. Then the middleware posts the telemetry event.</p>
                    </li>
                    <li className="ig">
                      <time>2 · Ingest API</time>
                      <p><span className="tag tg-ig">Ingest</span>API key checked, event published, <em>202 Accepted</em> returned.</p>
                    </li>
                    <li className="fb">
                      <time>3 · RabbitMQ</time>
                      <p><span className="tag tg-fb">Queue</span>The queue delivers the event to the consumer.</p>
                    </li>
                    <li className="wa">
                      <time>4 · Consumer</time>
                      <p><span className="tag tg-wa">Consumer</span>Raw event stored in MongoDB. Hourly bucket upserted in PostgreSQL.</p>
                    </li>
                    <li className="fb">
                      <time>5 · Dashboard</time>
                      <p><span className="tag tg-fb">Analytics</span>The analytics API reads the aggregated metrics for your charts.</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Platform Interactive Tabs */}
        <section className="sec" id="platform">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Platform<span className="badge">5</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Everything between a request<br /><span className="bubble">and a chart.</span></h2>
                <p className="lead">Ingest, reliability, storage, security and the dashboard share one pipeline, so nothing is wired together by hand.</p>
              </div>

              <div
                className="pf"
                style={{
                  boxShadow: `8px 8px 0 ${currentTab.tcur}`,
                }}
              >
                <div className="pf-nav" role="tablist" aria-label="Platform modules">
                  {platformTabs.map((tab, idx) => {
                    const isSelected = activeTab === idx;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        id={tab.id}
                        aria-selected={isSelected}
                        aria-controls={`pane-${idx}`}
                        tabIndex={isSelected ? 0 : -1}
                        style={{
                          ...(isSelected ? { boxShadow: `4px 4px 0 ${tab.tcur}` } : {}),
                        }}
                        onClick={() => setActiveTab(idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                      >
                        <i className="ti" style={{ background: tab.tc }}>{tab.icon}</i>
                        <div>
                          <b>{tab.name}</b>
                          <span>{tab.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="pf-pane"
                  style={{
                    background: `linear-gradient(180deg, ${currentTab.tint}, #fff 260px)`,
                  }}
                >
                  <div role="tabpanel" id={`pane-${activeTab}`} aria-labelledby={currentTab.id}>
                    <span className="kick" style={{ background: currentTab.tcur }}>{currentTab.kick}</span>
                    <h3>{currentTab.h3}</h3>
                    <p>{currentTab.desc}</p>
                    {currentTab.content}
                    <div className="pf-foot">
                      {currentTab.foot.map((item, i) => (
                        <span key={i}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Consumer / Pipeline SVG Canvas */}
        <section className="sec" id="automation">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Consumer<span className="badge">4</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Every event passes four checks.<br /><span className="bubble">Then it is stored.</span></h2>
                <p className="lead">The background consumer guards against duplicates, outages and slow writes before anything reaches your databases.</p>
              </div>

              <div className="af">
                <div className="af-bar">
                  <div>
                    <b>Consumer pipeline</b>
                    <small>Reads from api_hits and writes to MongoDB and PostgreSQL</small>
                  </div>
                  <div className="af-pills">
                    <span className="af-pill live">● Running</span>
                    <span className="af-pill">prefetch 10</span>
                    <span className="af-pill">run one consumer</span>
                  </div>
                </div>

                <div className="af-scroll">
                  <svg viewBox="0 0 980 260" aria-hidden="true">
                    <rect x="20" y="85" width="150" height="90" rx="14" fill="#fff" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="34" y="107">FROM QUEUE</text>
                    <text className="an-t" x="34" y="131">Consumer</text>
                    <text className="an-d" x="34" y="151">prefetch 10</text>
                    <rect x="215" y="85" width="150" height="90" rx="14" fill="#FFF6DD" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="229" y="107">CHECK</text>
                    <text className="an-t" x="229" y="131">Idempotency</text>
                    <text className="an-d" x="229" y="151">skips duplicate IDs</text>
                    <rect x="410" y="85" width="150" height="90" rx="14" fill="#F3EFFF" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="424" y="107">PROTECT</text>
                    <text className="an-t" x="424" y="131">Circuit breaker</text>
                    <text className="an-d" x="424" y="151">opens after 5 failures</text>
                    <rect x="605" y="85" width="150" height="90" rx="14" fill="#FFF0E9" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="619" y="107">RECOVER</text>
                    <text className="an-t" x="619" y="131">Retry engine</text>
                    <text className="an-d" x="619" y="151">1 s, 2 s, 4 s + jitter</text>
                    <rect x="800" y="20" width="160" height="64" rx="14" fill="#D4F5E3" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="814" y="42">RAW EVENTS</text>
                    <text className="an-t" x="814" y="66">MongoDB</text>
                    <text className="an-d" x="814" y="86">30-day TTL</text>
                    <rect x="800" y="98" width="160" height="64" rx="14" fill="#D9E6FB" stroke="#0E1512" strokeWidth="1.5" />
                    <text className="an-c" x="814" y="120">METRICS</text>
                    <text className="an-t" x="814" y="144">PostgreSQL</text>
                    <text className="an-d" x="814" y="164">hourly UPSERT</text>
                    <rect x="800" y="176" width="160" height="64" rx="14" fill="#FFE1D6" stroke="#0E1512" strokeWidth="1.5" strokeDasharray="5 4" />
                    <text className="an-c" x="814" y="198">FAILED</text>
                    <text className="an-t" x="814" y="222">Dead-letter queue</text>
                    <text className="an-d" x="814" y="242">api_hits.dlq</text>
                    <path className="base" d="M170 130H215" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M170 130H215" style={{ stroke: '#1FD27A' }} />
                    <path className="base" d="M365 130H410" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M365 130H410" style={{ stroke: '#F2B233' }} />
                    <path className="base" d="M560 130H605" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M560 130H605" style={{ stroke: '#7C5CFF' }} />
                    <path className="base" d="M755 130H778V52H800" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M755 130H778V52H800" style={{ stroke: '#1FD27A' }} />
                    <path className="base" d="M755 130H800" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M755 130H800" style={{ stroke: '#4C8DF0' }} />
                    <path className="base" d="M755 130H778V208H800" />
                    <path className="pulse" pathLength={100} strokeDasharray="14 86" d="M755 130H778V208H800" style={{ stroke: '#FF8A5B' }} />
                  </svg>
                </div>

                <div className="af-grid">
                  <div className="af-log">
                    <h4><span>Consumer log · sample</span><span>Today</span></h4>
                    <p><time>19:41:02</time><span>Event received <em>ok</em></span></p>
                    <p><time>19:41:02</time><span>Idempotency check passed <em>ok</em></span></p>
                    <p><time>19:41:03</time><span>Raw event saved to MongoDB <em>ok</em></span></p>
                    <p><time>19:41:03</time><span>Hourly bucket upserted in PostgreSQL <em>ok</em></span></p>
                    <p><time>19:41:45</time><span>MongoDB timeout, retry in 1.0 s</span></p>
                    <p><time>19:41:46</time><span>Retry saved <em>ok</em></span></p>
                  </div>
                  <div className="af-side">
                    <div className="af-stats">
                      <div className="af-stat"><b>~2 ms</b><small>to 202 Accepted</small></div>
                      <div className="af-stat"><b>30 s</b><small>breaker cooldown</small></div>
                      <div className="af-stat"><b>100K</b><small>dedupe cap</small></div>
                    </div>
                    <div className="af-trg">
                      <h4>Failures it handles</h4>
                      <div className="chips">
                        <span className="chip">RabbitMQ down</span>
                        <span className="chip">MongoDB timeout</span>
                        <span className="chip">PostgreSQL down</span>
                        <span className="chip">Duplicate delivery</span>
                        <span className="chip">Bad payload</span>
                        <span className="chip">Consumer restart</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: SDK */}
        <section className="sec" id="sdk">
          <div className="wrap row2">
            <div className="gut">
              <i></i>SDK<span className="badge">1</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>One middleware.<br /><span className="bubble">Two environment variables.</span></h2>
                <p className="lead">The middleware wraps res.end and posts the hit with setImmediate, after your response is already on its way.</p>
              </div>

              <div className="auto">
                <div className="rules">
                  <h3>Add Sendry to Express</h3>
                  <p>Copy monitoring.js into your app. It uses axios, so install that too.</p>
                  <div className="rule">
                    <span className="kw">INSTALL</span>
                    <div className="chips"><span className="rc"><b>npm install</b> axios</span></div>
                  </div>
                  <div className="rule">
                    <span className="kw">FILE</span>
                    <div className="chips"><span className="rc"><b>app.use</b>(monitoringMiddleware(&#123; serviceName: 'my-service' &#125;))</span></div>
                  </div>
                  <div className="rule">
                    <span className="kw">ENV</span>
                    <div className="chips"><span className="rc"><b>MONITORING_API_KEY</b>=your-api-key</span></div>
                  </div>
                  <div className="rule">
                    <span className="kw">ENV</span>
                    <div className="chips"><span className="rc"><b>MONITORING_ENDPOINT</b>=https://your-api/api/hit</span></div>
                  </div>
                </div>

                <div className="log">
                  <h4><span>What the SDK does</span><span>Per request</span></h4>
                  <p><span>res.end</span><span>Your response goes out unchanged <span className="ok">ok</span></span></p>
                  <p><span>tick</span><span>setImmediate builds the event: endpoint, method, status, latency</span></p>
                  <p><span>POST</span><span>/api/hit with the x-api-key header <span className="ok">202</span></span></p>
                  <p><span>timeout</span><span className="hi">After 3 s the SDK gives up. Your app never notices.</span></p>
                  <div className="log-f">
                    <div><b>~2 ms</b><small>to 202 Accepted</small></div>
                    <div><b>3 s</b><small>default timeout</small></div>
                    <div><b>1</b><small>dependency (axios)</small></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Dashboard Features */}
        <section className="sec" id="dashboard">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Dashboard<span className="badge">3</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>A dashboard that<br /><span className="bubble">reads at a glance.</span></h2>
                <p className="lead">Light, dark or auto theme, lazy-loaded pages and charts that refresh on their own.</p>
              </div>

              <div className="uc">
                <article>
                  <div className="ph"><div>SCREENSHOT 4:3<br />Overview page</div></div>
                  <h3>Overview</h3>
                  <p>Total hits, latency, error rate, success rate, services and endpoints, plus traffic and status-code charts.</p>
                  <div className="chips"><span className="chip">6 KPIs</span><span className="chip">2 charts</span></div>
                </article>

                <article>
                  <div className="ph"><div>SCREENSHOT 4:3<br />Top endpoints table</div></div>
                  <h3>Top endpoints</h3>
                  <p>A sortable table ranks routes by hits, latency and errors, so the slow and failing ones stand out.</p>
                  <div className="chips"><span className="chip">Sortable</span><span className="chip">Per service</span></div>
                </article>

                <article>
                  <div className="ph"><div>SCREENSHOT 4:3<br />Settings page</div></div>
                  <h3>Clients and API keys</h3>
                  <p>Create clients and issue scoped keys per environment. A key is shown once, so copy it.</p>
                  <div className="chips"><span className="chip">Environments</span><span className="chip">Roles</span></div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Reliability */}
        <section className="sec" id="reliability">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Reliability<span className="badge">6</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Built for the day<br /><span className="bubble">something breaks.</span></h2>
              </div>

              <div className="rel">
                <div className="rel-h">
                  <b><span className="dot"></span>Failures are planned for</b>
                  <span>Producer side and consumer side</span>
                </div>
                <div className="figs">
                  <div><b>~2 ms</b><span>to 202 Accepted</span></div>
                  <div><b>5</b><span>failures to open the breaker</span></div>
                  <div><b>3</b><span>retries before the dead-letter queue</span></div>
                  <div><b>30 days</b><span>raw log retention</span></div>
                </div>
              </div>

              <div className="tbl-wrap">
                <table className="t2">
                  <thead>
                    <tr>
                      <th scope="col"><span className="mono" style={{ fontSize: '12px', color: 'var(--mute)' }}>IF THIS HAPPENS</span></th>
                      <th scope="col"><span className="mono" style={{ fontSize: '12px', color: 'var(--mute)' }}>SENDRY DOES THIS</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">RabbitMQ is unreachable</th>
                      <td>After 5 failures the circuit breaker opens and ingest returns 503 at once instead of hanging. It probes again after a 30-second cooldown.</td>
                    </tr>
                    <tr>
                      <th scope="row">A database write fails</th>
                      <td>The consumer retries after 1 s, 2 s and 4 s, each with ±30% jitter. If it still fails, the event goes to the dead-letter queue.</td>
                    </tr>
                    <tr>
                      <th scope="row">PostgreSQL is down</th>
                      <td>The raw event is still saved in MongoDB. The metrics write is best-effort and is logged when it fails.</td>
                    </tr>
                    <tr>
                      <th scope="row">A message is redelivered</th>
                      <td>The idempotency guard skips events it has already seen. A unique index on the event ID is the backup.</td>
                    </tr>
                    <tr>
                      <th scope="row">An event is malformed</th>
                      <td>It goes straight to api_hits.dlq without retries. Nothing is discarded.</td>
                    </tr>
                    <tr>
                      <th scope="row">The consumer restarts</th>
                      <td>The durable queue keeps unprocessed events until the consumer is back.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Hosting */}
        <section className="sec" id="hosting">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Hosting<span className="badge">6</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Run it free.<br /><span className="bubble">Scale it when you need to.</span></h2>
                <p className="lead">Sendry is open source. These are the hosting tiers from the deployment guide, not Sendry plans.</p>
              </div>

              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col"><span className="mono" style={{ fontSize: '12px', color: 'var(--mute)' }}>HOSTING COST (USD)</span></th>
                      <th scope="col">
                        <b>Free demo</b>
                        <small>For trying it out</small>
                        <div className="pr">$0</div>
                        <a href="https://github.com/sultanxdev/sendry" target="_blank" rel="noreferrer" className="btn btn-o btn-sm">View on GitHub</a>
                      </th>
                      <th scope="col" className="hot">
                        <span className="flag">Always on</span>
                        <b>Production</b>
                        <small>No sleeping services</small>
                        <div className="pr">~$130<small>/ month</small></div>
                        <Link to="/docs" className="btn btn-k btn-sm">Read the guide</Link>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><th scope="row">Dashboard</th><td>Vercel, free</td><td className="hot">Vercel Pro, $20</td></tr>
                    <tr><th scope="row">API server</th><td>Render, free. Sleeps after 15 min</td><td className="hot">Render Starter, $7</td></tr>
                    <tr><th scope="row">Consumer</th><td>Render worker, free</td><td className="hot">Render Starter, $7</td></tr>
                    <tr><th scope="row">PostgreSQL</th><td>Render, free 1 GB. Expires after 90 days</td><td className="hot">Render Pro, $20</td></tr>
                    <tr><th scope="row">MongoDB</th><td>Atlas M0, 512 MB</td><td className="hot">Atlas M10, $57</td></tr>
                    <tr><th scope="row">RabbitMQ</th><td>CloudAMQP Little Lemur, 1M messages a month</td><td className="hot">CloudAMQP Bunny, $19, 5M messages</td></tr>
                  </tbody>
                </table>
              </div>

              <p className="note2">Prefer your own server? Docker Compose starts the API, consumer, MongoDB, PostgreSQL and RabbitMQ with one command.</p>
            </div>
          </div>
        </section>

        {/* Section: Roadmap */}
        <section className="sec" id="roadmap">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Roadmap<span className="badge">3</span>
            </div>
            <div>
              <div className="sec-h">
                <h2>Built as an MVP.<br /><span className="bubble">Here is what is next.</span></h2>
              </div>

              <div className="voices">
                <div className="big">
                  <q>The hard parts are done first. Tests, types and shared state come next.</q>
                  <div className="who">
                    <div className="av">S</div>
                    <div><b>Sendry roadmap</b><small>Highest priorities first</small></div>
                  </div>
                </div>

                <div className="small-col">
                  <div className="vb">
                    <p>TypeScript and automated tests, so the dual-database write path is checked by the compiler and by CI.</p>
                    <small className="pr2">Priority: high</small>
                  </div>
                  <div className="vb">
                    <p>Redis-backed circuit breaker and idempotency, so several consumers share state and survive restarts.</p>
                    <small className="pr2">Priority: high</small>
                  </div>
                  <div className="vb">
                    <p>Webhook alerts for error spikes, and live dashboard updates over SSE instead of polling.</p>
                    <small className="pr2">Priority: medium</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: FAQ */}
        <section className="sec" id="faq">
          <div className="wrap row2">
            <div className="gut">
              <i></i>Questions<span className="badge">5</span>
            </div>
            <div>
              <div className="sec-h" style={{ marginBottom: '40px' }}>
                <h2>Before you<br /><span className="bubble">send the first hit.</span></h2>
              </div>

              <div className="faq">
                <details>
                  <summary>Will it slow down my API?</summary>
                  <p>No. The middleware posts after your response is sent, and the ingest endpoint only validates and queues, so the 202 comes back in about 2 ms.</p>
                </details>
                <details>
                  <summary>Does the SDK have dependencies?</summary>
                  <p>One. The middleware uses axios to post events, so install axios in the app you monitor.</p>
                </details>
                <details>
                  <summary>Why use both MongoDB and PostgreSQL?</summary>
                  <p>MongoDB holds raw events and deletes them after 30 days. PostgreSQL holds hourly aggregates, so a 24-hour chart reads about 24 rows. The trade-off is that metrics lag raw events by a few seconds.</p>
                </details>
                <details>
                  <summary>What if RabbitMQ or a database goes down?</summary>
                  <p>A circuit breaker protects the ingest side, and the consumer retries with backoff and jitter before sending events to a dead-letter queue. The reliability table above covers each case.</p>
                </details>
                <details>
                  <summary>Is it production ready?</summary>
                  <p>It was built as an MVP. Tests, TypeScript and Redis-backed state are on the roadmap. Until then, run a single consumer, because breaker and idempotency state live in memory.</p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Final CTA */}
        <section className="sec">
          <div className="wrap">
            <div className="cta2">
              <div>
                <h2>Start with one service.<br /><span className="bubble">Grow to every API.</span></h2>
                <p className="lead">Create a client, copy an API key, add the middleware. Your first hits show up in the Overview within seconds.</p>
                <div className="row">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="btn btn-k">Go to Dashboard</Link>
                  ) : (
                    <Link to="/register" className="btn btn-k">Start free</Link>
                  )}
                  <Link to="/docs" className="btn btn-o">Read the docs</Link>
                </div>
                <div className="assure">
                  <span>Open source</span>
                  <span>MIT license</span>
                  <span>Self-hostable</span>
                </div>
              </div>

              <div className="steps">
                <h4>What happens next</h4>
                <ul>
                  <li style={{ '--c': '#1FD27A' }}>
                    <span className="n">1</span>
                    <div>
                      <b>Create a client and API key</b>
                      <small>In Settings. The key is shown once.</small>
                    </div>
                    <em className="t">Settings</em>
                  </li>
                  <li style={{ '--c': '#B9A6FF' }}>
                    <span className="n">2</span>
                    <div>
                      <b>Add the middleware</b>
                      <small>Set MONITORING_API_KEY and MONITORING_ENDPOINT.</small>
                    </div>
                    <em className="t">2 env vars</em>
                  </li>
                  <li style={{ '--c': '#FF9E7A' }}>
                    <span className="n">3</span>
                    <div>
                      <b>Open the Overview</b>
                      <small>Latency, errors and traffic, refreshed for you.</small>
                    </div>
                    <em className="t">Live</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="fg">
            <div>
              <a href="#top" className="logo">
                <span className="mark">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                Sendry
              </a>
              <p>Event-driven API monitoring for developers who care about every millisecond.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#platform">Platform</a></li>
                <li><a href="#sdk">SDK</a></li>
                <li><a href="#dashboard">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4>Trust</h4>
              <ul>
                <li><a href="#reliability">Reliability</a></li>
                <li><a href="#hosting">Hosting</a></li>
                <li><a href="#roadmap">Roadmap</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li><Link to="/docs">Setup docs</Link></li>
                <li><Link to="/docs">Deployment guide</Link></li>
                <li><a href="https://github.com/sultanxdev/sendry" target="_blank" rel="noreferrer">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Log in</Link></li>
                <li><Link to="/register">Create account</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="fbot">
            <span>© <span id="yr">{currentYear}</span> Sendry. Released under the MIT license.</span>
            <span>Self-host it, fork it, ship it.</span>
          </div>
        </div>
        <div className="mega" aria-hidden="true">Sendry</div>
      </footer>
    </div>
  );
}

export default LandingPage;
