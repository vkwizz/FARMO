'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import StatCard from '@/components/StatCard';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const soilData = [
    { date: 'Feb 1', nitrogen: 42, phosphorus: 28, potassium: 55, pH: 6.1 },
    { date: 'Feb 8', nitrogen: 45, phosphorus: 31, potassium: 52, pH: 6.2 },
    { date: 'Feb 15', nitrogen: 38, phosphorus: 26, potassium: 48, pH: 5.9 },
    { date: 'Feb 22', nitrogen: 50, phosphorus: 35, potassium: 60, pH: 6.3 },
    { date: 'Mar 1', nitrogen: 48, phosphorus: 33, potassium: 58, pH: 6.2 },
    { date: 'Mar 4', nitrogen: 52, phosphorus: 36, potassium: 62, pH: 6.4 },
];

const waterUsage = [
    { week: 'W1', actual: 4200, optimized: 3100, target: 3500 },
    { week: 'W2', actual: 3800, optimized: 2900, target: 3500 },
    { week: 'W3', actual: 4100, optimized: 3200, target: 3500 },
    { week: 'W4', actual: 3600, optimized: 2800, target: 3500 },
    { week: 'W5', actual: 3900, optimized: 3000, target: 3500 },
    { week: 'W6', actual: 3500, optimized: 2700, target: 3500 },
];

const fertSchedule = [
    { fertilizer: 'Urea (N)', zone: 'All Zones', dose: '22 kg/acre', dueDate: 'Mar 8', status: 'Due Soon', color: '#fbbf24' },
    { fertilizer: 'MOP (K)', zone: 'Zone A, B', dose: '18 kg/acre', dueDate: 'Mar 12', status: 'Upcoming', color: '#38bdf8' },
    { fertilizer: 'Rock Phosphate', zone: 'Zone C', dose: '15 kg/acre', dueDate: 'Mar 18', status: 'Planned', color: '#a78bfa' },
    { fertilizer: 'Borax + ZnSO₄', zone: 'Zone B', dose: '2 kg/acre', dueDate: 'Mar 5', status: 'Overdue', color: '#fb7185' },
    { fertilizer: 'Organic Compost', zone: 'All Zones', dose: '200 kg/acre', dueDate: 'Apr 1', status: 'Planned', color: '#a78bfa' },
];

const nutrientPie = [
    { name: 'Nitrogen', value: 38, color: '#34d399' },
    { name: 'Phosphorus', value: 22, color: '#38bdf8' },
    { name: 'Potassium', value: 28, color: '#fbbf24' },
    { name: 'Micronutrients', value: 12, color: '#a78bfa' },
];

const iotSensors = [
    { id: 'S01', zone: 'Zone A', moisture: 62, temp: 28, pH: 6.2, EC: 1.4, status: 'Online' },
    { id: 'S02', zone: 'Zone B', moisture: 45, temp: 29, pH: 5.8, EC: 1.2, status: 'Online' },
    { id: 'S03', zone: 'Zone C', moisture: 71, temp: 27, pH: 6.5, EC: 1.6, status: 'Online' },
    { id: 'S04', zone: 'Zone D', moisture: 38, temp: 30, pH: 6.0, EC: 1.1, status: 'Offline' },
];

export default function ResourcePage() {
    const [activeTab, setActiveTab] = useState('soil');

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <PageLayout>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(14,165,233,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.2)' }}>
                        💧 Resource Management Agent
                    </span>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: '8px', lineHeight: 1.1 }}>
                        Resource <span style={{ background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Optimization</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                        IoT sensor fusion · Smart irrigation · AI-driven fertilizer scheduling
                    </p>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: '24px' }}>
                    <StatCard icon="💧" label="Water Saved (Mar)" value="12,400L" sub="vs conventional method" color="#38bdf8" trend={22.3} />
                    <StatCard icon="🌱" label="Fertilizer Efficiency" value="89%" sub="AI-optimized dosing" color="#34d399" trend={15.2} />
                    <StatCard icon="📡" label="IoT Sensors Online" value="3/4" sub="1 sensor offline" color="#fbbf24" />
                    <StatCard icon="💰" label="Input Cost Saved" value="₹8,240" sub="This season" color="#a78bfa" trend={18.6} />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { key: 'soil', label: '🌱 Soil Health' },
                        { key: 'water', label: '💧 Irrigation' },
                        { key: 'fertilizer', label: '🧪 Fertilizer' },
                        { key: 'iot', label: '📡 IoT Sensors' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: activeTab === t.key ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === t.key ? '#38bdf8' : '#64748b',
                            border: activeTab === t.key ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            fontWeight: activeTab === t.key ? 600 : 400,
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'soil' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <div className="section-title" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Soil Nutrient Trends</div>
                            <div className="section-subtitle" style={{ marginBottom: '20px' }}>NPK levels from IoT soil sensors (mg/kg)</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={soilData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                    <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                    <Line dataKey="nitrogen" stroke="#34d399" strokeWidth={2} dot={false} name="Nitrogen" />
                                    <Line dataKey="phosphorus" stroke="#38bdf8" strokeWidth={2} dot={false} name="Phosphorus" />
                                    <Line dataKey="potassium" stroke="#fbbf24" strokeWidth={2} dot={false} name="Potassium" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                {[['N', '#34d399', 'Low – Apply Urea'], ['P', '#38bdf8', 'Adequate'], ['K', '#fbbf24', 'Good']].map(([k, c, s]) => (
                                    <div key={k} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: `rgba(${hexToRgb(c)}, 0.06)`, border: `1px solid rgba(${hexToRgb(c)}, 0.15)` }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>{k} Status</div>
                                        <div style={{ fontSize: '0.82rem', color: c, fontWeight: 600 }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <div className="section-title" style={{ fontSize: '1rem', marginBottom: '16px' }}>Nutrient Distribution</div>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={nutrientPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {nutrientPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                {nutrientPie.map(n => (
                                    <div key={n.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color }} />
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{n.name}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>{n.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'water' && (
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <div className="section-title" style={{ fontSize: '1.1rem' }}>Irrigation Optimization</div>
                                <div className="section-subtitle">AI vs conventional water usage (Litres/week)</div>
                            </div>
                            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Avg. Savings</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>~27%</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={waterUsage}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                <Bar dataKey="actual" fill="rgba(100,116,139,0.4)" name="Conventional" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="optimized" fill="#0ea5e9" name="AI Optimized" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="target" fill="rgba(52,211,153,0.3)" name="Target" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeTab === 'fertilizer' && (
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div className="section-title" style={{ fontSize: '1.1rem' }}>Fertilizer Schedule</div>
                            <div className="section-subtitle">AI-recommended dosing calendar</div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}>
                                        {['Fertilizer', 'Zone', 'Dose/Acre', 'Due Date', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fertSchedule.map((f, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '14px', color: '#f1f5f9', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }} />
                                                    {f.fertilizer}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px', color: '#94a3b8' }}>{f.zone}</td>
                                            <td style={{ padding: '14px', color: '#e2e8f0' }}>{f.dose}</td>
                                            <td style={{ padding: '14px', color: '#cbd5e1' }}>{f.dueDate}</td>
                                            <td style={{ padding: '14px' }}>
                                                <span className={`badge badge-${f.status === 'Overdue' ? 'danger' : f.status === 'Due Soon' ? 'warning' : f.status === 'Upcoming' ? 'info' : 'violet'}`}>{f.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'iot' && (
                    <div className="grid-2">
                        {iotSensors.map(sensor => (
                            <div key={sensor.id} className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontSize: '22px' }}>📡</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>Sensor {sensor.id}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sensor.zone}</div>
                                        </div>
                                    </div>
                                    <span className={`badge badge-${sensor.status === 'Online' ? 'success' : 'danger'}`}>{sensor.status}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {[
                                        { label: 'Moisture', value: `${sensor.moisture}%`, color: '#38bdf8', icon: '💧', ok: sensor.moisture > 40 },
                                        { label: 'Temperature', value: `${sensor.temp}°C`, color: '#fbbf24', icon: '🌡️', ok: sensor.temp < 32 },
                                        { label: 'Soil pH', value: sensor.pH, color: '#34d399', icon: '⚗️', ok: sensor.pH > 5.5 && sensor.pH < 7 },
                                        { label: 'EC (dS/m)', value: sensor.EC, color: '#a78bfa', icon: '⚡', ok: sensor.EC < 2 },
                                    ].map(m => (
                                        <div key={m.label} style={{ padding: '10px', borderRadius: '8px', background: `rgba(${hexToRgb(m.color)},0.06)`, border: `1px solid rgba(${hexToRgb(m.color)},0.15)` }}>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '4px' }}>{m.icon} {m.label}</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                                            <div style={{ fontSize: '0.68rem', color: m.ok ? '#34d399' : '#fb7185', marginTop: '2px' }}>{m.ok ? '✓ Normal' : '⚠ Alert'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PageLayout>
        </div>
    );
}

function hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return '52,211,153';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}
