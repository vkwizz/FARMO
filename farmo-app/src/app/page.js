'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const yieldData = [
  { month: 'Sep', yield: 62, target: 70 },
  { month: 'Oct', yield: 68, target: 70 },
  { month: 'Nov', yield: 71, target: 70 },
  { month: 'Dec', yield: 74, target: 72 },
  { month: 'Jan', yield: 79, target: 75 },
  { month: 'Feb', yield: 83, target: 75 },
  { month: 'Mar', yield: 88, target: 78 },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const [iotData, setIotData] = useState({
    soil: 0,
    light: 0,
    humidity: 0,
    temperature: 0,
    time: 'Connecting...'
  });

  // Fetch live IoT data every 5 seconds
  useEffect(() => {
    const fetchIoT = async () => {
      try {
        const response = await fetch('http://localhost:10000/data');
        if (response.ok) {
          const data = await response.json();
          setIotData(data);
        }
      } catch (err) {
        console.error("IoT Fetch Error:", err);
      }
    };
    fetchIoT();
    const interval = setInterval(fetchIoT, 5000);
    return () => clearInterval(interval);
  }, []);

  const diseaseAlerts = [
    { zone: t.zone1, type: t.disease1, severity: t.high, rawSeverity: 'High', time: '2h ago', color: '#fb7185' },
    { zone: t.zone2, type: t.disease2, severity: t.medium, rawSeverity: 'Medium', time: '5h ago', color: '#fbbf24' },
    { zone: t.zone3, type: t.disease3, severity: t.low, rawSeverity: 'Low', time: '1d ago', color: '#34d399' },
  ];

  const recentActivities = [
    { icon: '🤖', text: t.act1, time: '10 min' },
    { icon: '💧', text: t.act2, time: '1h' },
    { icon: '📈', text: t.act3, time: '3h' },
    { icon: '🌧️', text: t.act4, time: '5h' },
    { icon: '🌿', text: t.act5, time: '6h' },
  ];

  const weatherForecast = [
    { day: 'Wed', icon: '☀️', high: 32, low: 24 },
    { day: 'Thu', icon: '⛅', high: 30, low: 23 },
    { day: 'Fri', icon: '🌧️', high: 27, low: 21 },
    { day: 'Sat', icon: '🌧️', high: 25, low: 20 },
    { day: 'Sun', icon: '⛅', high: 28, low: 22 },
  ];

  const agentCards = [
    { href: '/crop-health', icon: '🔬', title: t.cropHealthAgent, desc: t.cropHealthDesc, color: '#34d399', stat: t.cropHealthStat },
    { href: '/resource', icon: '💧', title: t.resourceAgent, desc: t.resourceDesc, color: '#38bdf8', stat: t.resourceStat },
    { href: '/advisory', icon: '🗣️', title: t.advisoryAgent, desc: t.advisoryDesc, color: '#fb7185', stat: t.advisoryStat },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <PageLayout>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(52,211,153,0.2)' }}>
                  {t.liveDashboard || "LIVE DASHBOARD"}
                </span>
                <span className="pulse" style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></span>
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>
                FARMO <span className="gradient-text">{t.commandCenter}</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                {t.dashboardSubtitle}
              </p>
            </div>
            <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Last Sync</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', fontFamily: 'Space Grotesk' }}>{iotData.time}</div>
              </div>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(52,211,153,0.2)' }}>
                 <span style={{ fontSize: '20px' }}>📡</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Field Stats */}
        <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></div>
                FIELD STATUS (REAL-TIME)
            </div>
            <div className="grid-4">
                <StatCard icon="💧" label="Soil Moisture" value={`${iotData.soil}%`} sub={iotData.soil < 30 ? "Critical" : "Optimal"} color="#38bdf8" />
                <StatCard icon="☀️" label="Light Level" value={`${iotData.light}%`} sub="Normal" color="#fbbf24" />
                <StatCard icon="🌡️" label="Humidity" value={`${iotData.humidity}%`} sub="Ambient" color="#34d399" />
                <StatCard icon="🌡️" label="Temperature" value={`${iotData.temperature}°C`} sub="Air Temp" color="#fb7185" />
            </div>
        </div>

        {/* KPI Stats */}
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <StatCard icon="🌳" label={t.totalTrees} value="1,240" sub={t.totalTreesSub} color="#34d399" trend={2.1} />
          <StatCard icon="🧴" label={t.dailyLatex} value="38.4" sub={t.dailyLatexSub} color="#38bdf8" trend={-4.2} />
          <StatCard icon="💰" label={t.revenue} value="₹68,420" sub={t.revenueSub} color="#fbbf24" trend={11.8} />
          <StatCard icon="⚠️" label={t.diseaseAlerts} value="3" sub={t.diseaseAlertsSub} color="#fb7185" />
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px' }}>
          {/* Yield Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="section-title" style={{ fontSize: '1.1rem' }}>{t.yieldPerformance}</div>
                <div className="section-subtitle">{t.yieldSubtitle}</div>
              </div>
              <span className="badge badge-success">↑ 18.9% MoM</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="target" stroke="#334155" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                <Area type="monotone" dataKey="yield" stroke="#10b981" fill="url(#yieldGrad)" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Disease Alerts */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="section-title" style={{ fontSize: '1.1rem' }}>{t.activeAlerts}</div>
              <Link href="/crop-health" style={{ fontSize: '0.8rem', color: '#34d399', textDecoration: 'none' }}>{t.viewAll}</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {diseaseAlerts.map((a, i) => (
                <div key={i} style={{
                  padding: '12px', borderRadius: '10px',
                  background: `rgba(${a.rawSeverity === 'High' ? '244,63,94' : a.rawSeverity === 'Medium' ? '245,158,11' : '52,211,153'}, 0.06)`,
                  border: `1px solid rgba(${a.rawSeverity === 'High' ? '244,63,94' : a.rawSeverity === 'Medium' ? '245,158,11' : '52,211,153'}, 0.2)`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{a.zone}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{a.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{a.type}</span>
                    <span className={`badge badge-${a.rawSeverity === 'High' ? 'danger' : a.rawSeverity === 'Medium' ? 'warning' : 'success'}`} style={{ fontSize: '0.65rem' }}>
                      {a.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="section-title">{t.aiAgents}</div>
            <div className="section-subtitle">{t.aiAgentsSubtitle}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {agentCards.map(agent => (
              <Link key={agent.href} href={agent.href} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: '18px', cursor: 'pointer', borderColor: `rgba(${hexToRgb(agent.color)}, 0.15)` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(${hexToRgb(agent.color)}, 0.4)`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `rgba(${hexToRgb(agent.color)}, 0.15)`}
                >
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{agent.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>{agent.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, marginBottom: '10px' }}>{agent.desc}</div>
                  <span style={{ fontSize: '0.72rem', color: agent.color, fontWeight: 600, background: `rgba(${hexToRgb(agent.color)}, 0.1)`, padding: '3px 8px', borderRadius: '20px' }}>
                    {agent.stat}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>{t.agentActivityFeed}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '18px', marginTop: '1px' }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>{a.text}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{a.time} {t.ago}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Forecast */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="section-title" style={{ fontSize: '1.05rem' }}>{t.fiveDayForecast}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {weatherForecast.map((w, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center', padding: '12px 6px', borderRadius: '10px',
                  background: i === 0 ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.02)',
                  border: i === 0 ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>{w.day}</div>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{w.icon}</div>
                  <div style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>{w.high}°</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{w.low}°</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '3px' }}>{t.tappingAdvisory}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{t.tappingAdvisoryText}</div>
            </div>
          </div>
        </div>

      </PageLayout>
    </div>
  );
}

function hexToRgb(hex) {
  if (!hex.startsWith('#')) return '52,211,153';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
