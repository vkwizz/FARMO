'use client';
import { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import StatCard from '@/components/StatCard';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const diseases = [
    { name: 'Powdery Mildew', pathogen: 'Oidium heveae', severity: 'High', treatment: 'Sulphur-based fungicide spray, 0.3% wettable sulphur', trees: 23, confidence: 94.2, color: '#fb7185' },
    { name: 'Leaf Fall Disease', pathogen: 'Phytophthora meadii', severity: 'Medium', treatment: 'Bordeaux mixture 1%, avoid wounding', trees: 12, confidence: 88.7, color: '#fbbf24' },
    { name: 'Pink Disease', pathogen: 'Erythricium salmonicolor', severity: 'Low', treatment: 'Tridemorph 5% trunk painting', trees: 4, confidence: 91.5, color: '#34d399' },
    { name: 'Abnormal Leaf Fall', pathogen: 'Phytophthora sp.', severity: 'Monitor', treatment: 'Prophylactic metalaxyl application', trees: 7, confidence: 79.3, color: '#38bdf8' },
];

const radarData = [
    { metric: 'Leaf Health', score: 72 },
    { metric: 'Bark Condition', score: 85 },
    { metric: 'Root Health', score: 68 },
    { metric: 'Canopy Density', score: 91 },
    { metric: 'Nutrient Level', score: 63 },
    { metric: 'Moisture', score: 78 },
];

const weeklyScans = [
    { day: 'Mon', healthy: 180, diseased: 12, warning: 8 },
    { day: 'Tue', healthy: 175, diseased: 15, warning: 10 },
    { day: 'Wed', healthy: 188, diseased: 8, warning: 4 },
    { day: 'Thu', healthy: 172, diseased: 20, warning: 8 },
    { day: 'Fri', healthy: 191, diseased: 6, warning: 3 },
    { day: 'Sat', healthy: 168, diseased: 22, warning: 10 },
    { day: 'Sun', healthy: 185, diseased: 10, warning: 5 },
];

export default function CropHealthPage() {
    const [dragging, setDragging] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileRef = useRef();

    const handleFile = (file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setAnalyzing(true);
        setResult(null);
        // Simulate AI analysis
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                disease: 'Powdery Mildew',
                confidence: 94.2,
                severity: 'High',
                pathogen: 'Oidium heveae',
                stage: 'Early Stage',
                recommendation: 'Apply 0.3% wettable sulphur fungicide spray. Repeat every 10–14 days. Remove heavily infected leaves. Ensure good canopy air circulation. Apply potassium fertilizer to boost immunity.',
                mlayalam: 'ഈ ഇലകളിൽ പൊടിപ്പൻ ചർമ്മ രോഗം കണ്ടെത്തിയിരിക്കുന്നു. ഗന്ദകം അടങ്ങിയ കീടനാശിനി (0.3%) ഉടൻ ഉപയോഗിക്കുക. 10–14 ദിവസം കൂടുമ്പോൾ ആവർത്തിക്കുക.',
                affected_area: '~18%',
                spread_risk: 'Medium–High',
            });
        }, 2800);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <PageLayout>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(52,211,153,0.2)' }}>
                        🔬 Crop Health Agent
                    </span>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: '8px', lineHeight: 1.1 }}>
                        Disease Detection <span className="gradient-text">&amp; Monitoring</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                        CNN + Vision Transformer AI models · PlantVillage dataset + Kerala-specific training data
                    </p>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: '24px' }}>
                    <StatCard icon="🌳" label="Trees Monitored" value="1,240" sub="Weekly AI scan" color="#34d399" trend={0.8} />
                    <StatCard icon="⚠️" label="Diseased Trees" value="46" sub="3.7% of total" color="#fb7185" trend={-8.2} />
                    <StatCard icon="🔬" label="AI Scan Accuracy" value="96.8%" sub="Cross-validated" color="#38bdf8" />
                    <StatCard icon="✅" label="Treated This Week" value="31" sub="Out of 46 flagged" color="#fbbf24" trend={12.5} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Upload / Scan */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div className="section-title" style={{ fontSize: '1.1rem' }}>📷 Leaf Disease Scanner</div>
                            <div className="section-subtitle">Upload a leaf photo for instant AI diagnosis</div>
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => fileRef.current.click()}
                            style={{
                                border: `2px dashed ${dragging ? '#34d399' : 'rgba(52,211,153,0.25)'}`,
                                borderRadius: '12px',
                                padding: '32px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragging ? 'rgba(52,211,153,0.05)' : 'rgba(0,0,0,0.15)',
                                transition: 'all 0.3s ease',
                                marginBottom: '16px',
                            }}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Leaf preview" style={{ maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', maxWidth: '100%' }} />
                            ) : (
                                <>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍃</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Drag &amp; drop a leaf photo</div>
                                    <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '4px' }}>or click to browse · JPG, PNG, HEIC</div>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

                        {analyzing && (
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Running EfficientNet + ViT ensemble…</div>
                                <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '4px' }}>Checking against 38 disease patterns</div>
                            </div>
                        )}

                        {result && !analyzing && (
                            <div style={{ borderRadius: '12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>🦠</span>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{result.disease}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{result.pathogen}</div>
                                        </div>
                                    </div>
                                    <span className="badge badge-danger">{result.confidence}% confidence</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <span className="badge badge-danger">{result.severity}</span>
                                    <span className="badge badge-info">{result.stage}</span>
                                    <span className="badge badge-warning">Spread: {result.spread_risk}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '10px', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#34d399' }}>Treatment:</strong> {result.recommendation}
                                </div>
                                <div style={{ borderRadius: '8px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', padding: '10px', fontFamily: 'Noto Sans Malayalam, sans-serif', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>
                                    🌿 <em>Malayalam:</em> {result.mlayalam}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Radar + Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
                            <div className="section-title" style={{ fontSize: '1rem', marginBottom: '4px' }}>Plant Health Radar</div>
                            <div className="section-subtitle" style={{ marginBottom: '16px' }}>Multi-parameter health assessment</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(52,211,153,0.1)" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Weekly Scan Chart */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div className="section-title" style={{ fontSize: '1.1rem' }}>Weekly Tree Health Scan Results</div>
                        <div className="section-subtitle">AI-generated scan outcomes across your plantation</div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyScans}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                            <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                            <Bar dataKey="healthy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Healthy" />
                            <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
                            <Bar dataKey="diseased" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Diseased" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Disease Table */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div className="section-title" style={{ fontSize: '1.1rem' }}>Active Disease Registry</div>
                        <div className="section-subtitle">Current disease status across plantation zones</div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}>
                                    {['Disease', 'Pathogen', 'Severity', 'Trees Affected', 'AI Confidence', 'Treatment'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {diseases.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px', color: '#f1f5f9', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                                                {d.name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#94a3b8', fontStyle: 'italic' }}>{d.pathogen}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span className={`badge badge-${d.severity === 'High' ? 'danger' : d.severity === 'Medium' ? 'warning' : d.severity === 'Low' ? 'success' : 'info'}`}>{d.severity}</span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#e2e8f0' }}>{d.trees}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="progress-bar" style={{ width: '60px' }}>
                                                    <div className="progress-fill" style={{ width: `${d.confidence}%`, background: d.color }} />
                                                </div>
                                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{d.confidence}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#64748b', fontSize: '0.78rem', maxWidth: '200px' }}>{d.treatment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PageLayout>
        </div>
    );
}
