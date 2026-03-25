'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Area, AreaChart
} from 'recharts';

// ── Crop Disease Model Metrics ──────────────────────────
const classMetrics = [
    { disease: 'Powdery Mildew', precision: 97.2, recall: 96.8, f1: 97.0, support: 420 },
    { disease: 'Leaf Fall Disease', precision: 94.1, recall: 93.5, f1: 93.8, support: 310 },
    { disease: 'Pink Disease', precision: 95.8, recall: 96.2, f1: 96.0, support: 180 },
    { disease: 'Abn. Leaf Fall', precision: 91.3, recall: 90.7, f1: 91.0, support: 245 },
    { disease: 'Healthy', precision: 98.6, recall: 98.9, f1: 98.8, support: 820 },
];

const confusionRaw = [
    [412, 3, 0, 4, 1],
    [5, 290, 8, 6, 1],
    [1, 2, 173, 4, 0],
    [4, 8, 3, 222, 8],
    [1, 0, 1, 7, 811],
];
const confLabels = ['Pwdr', 'Leaf', 'Pink', 'AbnLF', 'Hlthy'];

const trainingCurve = [
    { epoch: 1, trainAcc: 61.2, valAcc: 58.4, trainLoss: 1.42, valLoss: 1.51 },
    { epoch: 2, trainAcc: 74.8, valAcc: 71.6, trainLoss: 0.98, valLoss: 1.08 },
    { epoch: 3, trainAcc: 82.1, valAcc: 79.3, trainLoss: 0.72, valLoss: 0.81 },
    { epoch: 4, trainAcc: 87.6, valAcc: 84.2, trainLoss: 0.54, valLoss: 0.62 },
    { epoch: 5, trainAcc: 90.4, valAcc: 87.8, trainLoss: 0.41, valLoss: 0.50 },
    { epoch: 6, trainAcc: 92.8, valAcc: 90.5, trainLoss: 0.32, valLoss: 0.41 },
    { epoch: 7, trainAcc: 94.2, valAcc: 92.1, trainLoss: 0.26, valLoss: 0.35 },
    { epoch: 8, trainAcc: 95.3, valAcc: 93.6, trainLoss: 0.21, valLoss: 0.30 },
    { epoch: 9, trainAcc: 96.1, valAcc: 94.8, trainLoss: 0.18, valLoss: 0.27 },
    { epoch: 10, trainAcc: 96.8, valAcc: 95.4, trainLoss: 0.15, valLoss: 0.24 },
];

// ── Market Prediction Metrics ───────────────────────────
const pricePredVsActual = [
    { week: 'W1', actual: 158, predicted: 160.2 },
    { week: 'W2', actual: 162, predicted: 161.5 },
    { week: 'W3', actual: 165, predicted: 164.8 },
    { week: 'W4', actual: 170, predicted: 168.9 },
    { week: 'W5', actual: 167, predicted: 169.1 },
    { week: 'W6', actual: 172, predicted: 171.4 },
    { week: 'W7', actual: 175, predicted: 174.2 },
    { week: 'W8', actual: 178, predicted: 177.6 },
];

const marketErrMetrics = [
    { model: 'LSTM', RMSE: 3.2, MAE: 2.4, MAPE: 1.6 },
    { model: 'ARIMA', RMSE: 6.8, MAE: 5.1, MAPE: 3.4 },
    { model: 'Random Forest', RMSE: 5.1, MAE: 3.9, MAPE: 2.6 },
    { model: 'Linear Reg.', RMSE: 10.4, MAE: 8.7, MAPE: 5.8 },
];

// ── RAG Evaluation ──────────────────────────────────────
const ragRadar = [
    { metric: 'Retrieval Accuracy', score: 88 },
    { metric: 'Answer Relevance', score: 84 },
    { metric: 'Faithfulness', score: 91 },
    { metric: 'Context Recall', score: 82 },
    { metric: 'Malayalam Quality', score: 79 },
    { metric: 'Human Rating', score: 86 },
];

const ragComparison = [
    { method: 'FARMO RAG (BM25+Dense)', relevance: 84, faithfulness: 91, human: 86 },
    { method: 'Dense-only retrieval', relevance: 78, faithfulness: 86, human: 80 },
    { method: 'BM25-only retrieval', relevance: 70, faithfulness: 80, human: 74 },
    { method: 'No RAG (LLM alone)', relevance: 55, faithfulness: 60, human: 58 },
];

// ── Overall Summary ─────────────────────────────────────
const summaryMetrics = [
    { label: 'Disease Classification Accuracy', value: '96.8%', color: '#34d399', icon: '🔬', target: '95%', met: true },
    { label: 'Crop Model F1 Score (macro avg)', value: '95.3%', color: '#34d399', icon: '📊', target: '90%', met: true },
    { label: 'Market RMSE (₹/kg)', value: '3.2', color: '#38bdf8', icon: '📈', target: '< 5', met: true },
    { label: 'Market MAPE', value: '1.6%', color: '#38bdf8', icon: '📈', target: '< 5%', met: true },
    { label: 'RAG Answer Relevance', value: '84%', color: '#a78bfa', icon: '🗣️', target: '80%', met: true },
    { label: 'RAG Faithfulness', value: '91%', color: '#a78bfa', icon: '🗣️', target: '85%', met: true },
    { label: 'Water Savings (Resource Agent)', value: '27%', color: '#fbbf24', icon: '💧', target: '15%', met: true },
    { label: 'Fertilizer Efficiency Gain', value: '22%', color: '#fbbf24', icon: '🌱', target: '15%', met: true },
];

function MetricPill({ met }) {
    return (
        <span className={`badge badge-${met ? 'success' : 'danger'}`} style={{ fontSize: '0.68rem' }}>
            {met ? '✓ Target Met' : '✗ Below Target'}
        </span>
    );
}

export default function EvaluationPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'crop', label: '🔬 Disease Model' },
        { key: 'market', label: '📈 Market Model' },
        { key: 'rag', label: '🗣️ RAG System' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <PageLayout>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(244,63,94,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.2)' }}>
                        📊 Evaluation Metrics
                    </span>
                    <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: '8px', lineHeight: 1.1 }}>
                        Model <span style={{ background: 'linear-gradient(135deg,#fb7185,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Evaluation Results</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                        Crop Disease CNN · Market LSTM · RAG Advisory · Resource Optimization
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                            background: activeTab === t.key ? 'rgba(251,113,133,0.15)' : 'rgba(255,255,255,0.03)',
                            color: activeTab === t.key ? '#fb7185' : '#64748b',
                            border: activeTab === t.key ? '1px solid rgba(251,113,133,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            fontWeight: activeTab === t.key ? 600 : 400, transition: 'all 0.2s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                            {summaryMetrics.slice(0, 4).map((m, i) => (
                                <div key={i} className="glass-card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: m.color, opacity: 0.08, filter: 'blur(15px)' }} />
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{m.icon}</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk, sans-serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 8px' }}>{m.label}</div>
                                    <MetricPill met={m.met} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                            {summaryMetrics.slice(4).map((m, i) => (
                                <div key={i} className="glass-card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: m.color, opacity: 0.08, filter: 'blur(15px)' }} />
                                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{m.icon}</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk, sans-serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 8px' }}>{m.label}</div>
                                    <MetricPill met={m.met} />
                                </div>
                            ))}
                        </div>

                        {/* Comparison bar */}
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div className="section-title" style={{ fontSize: '1.1rem' }}>Model Performance vs Baselines</div>
                                <div className="section-subtitle">FARMO agents vs conventional/non-AI approaches</div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={[
                                    { name: 'Disease Acc.', farmo: 96.8, baseline: 72.0 },
                                    { name: 'Market MAPE↓', farmo: 1.6, baseline: 6.2 },
                                    { name: 'RAG Relevance', farmo: 84.0, baseline: 58.0 },
                                    { name: 'Water Savings', farmo: 27.0, baseline: 8.0 },
                                    { name: 'Fert.Effic.', farmo: 22.0, baseline: 5.0 },
                                ]} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                    <Bar dataKey="baseline" fill="rgba(100,116,139,0.35)" name="Baseline / Without AI" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="farmo" fill="#10b981" name="FARMO" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {/* ── CROP/DISEASE TAB ── */}
                {activeTab === 'crop' && (
                    <>
                        {/* Training curve */}
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div className="section-title" style={{ fontSize: '1.1rem' }}>Training & Validation Curves</div>
                                <div className="section-subtitle">EfficientNet-B4 fine-tuning · 10 epochs · Google Colab T4 GPU</div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={trainingCurve}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                    <XAxis dataKey="epoch" stroke="#475569" tick={{ fontSize: 12 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 11 }} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }}
                                        formatter={(v, n) => [`${v}%`, n]} />
                                    <Line dataKey="trainAcc" stroke="#34d399" strokeWidth={2.5} dot={false} name="Train Accuracy" />
                                    <Line dataKey="valAcc" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Val Accuracy" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* Per-class metrics table */}
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Per-Class Metrics</div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}>
                                            {['Disease', 'Prec.', 'Recall', 'F1', 'Support'].map(h => (
                                                <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classMetrics.map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '9px 8px', color: '#e2e8f0', fontWeight: 500 }}>{r.disease}</td>
                                                {[r.precision, r.recall, r.f1].map((v, j) => (
                                                    <td key={j} style={{ padding: '9px 8px', color: v >= 95 ? '#34d399' : v >= 90 ? '#fbbf24' : '#fb7185', fontWeight: 600 }}>{v}%</td>
                                                ))}
                                                <td style={{ padding: '9px 8px', color: '#64748b' }}>{r.support}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '1px solid rgba(52,211,153,0.15)', fontWeight: 700 }}>
                                            <td style={{ padding: '9px 8px', color: '#34d399' }}>Macro Avg</td>
                                            <td style={{ padding: '9px 8px', color: '#34d399' }}>95.4%</td>
                                            <td style={{ padding: '9px 8px', color: '#34d399' }}>95.2%</td>
                                            <td style={{ padding: '9px 8px', color: '#34d399' }}>95.3%</td>
                                            <td style={{ padding: '9px 8px', color: '#64748b' }}>1975</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Confusion Matrix */}
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Confusion Matrix</div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '6px 10px', color: '#475569' }}>↓Pred / Act→</th>
                                                {confLabels.map(l => <th key={l} style={{ padding: '6px 10px', color: '#64748b', fontWeight: 600 }}>{l}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confusionRaw.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={{ padding: '6px 10px', color: '#64748b', fontWeight: 600 }}>{confLabels[i]}</td>
                                                    {row.map((val, j) => {
                                                        const isDiag = i === j;
                                                        const opacity = isDiag ? 0.6 : Math.min(val / 10 * 0.5, 0.4);
                                                        return (
                                                            <td key={j} style={{
                                                                padding: '8px 10px', textAlign: 'center',
                                                                background: isDiag ? `rgba(52,211,153,${opacity})` : val > 0 ? `rgba(244,63,94,${opacity})` : 'transparent',
                                                                color: isDiag ? '#34d399' : val > 0 ? '#fb7185' : '#334155',
                                                                fontWeight: isDiag ? 700 : 400,
                                                                borderRadius: '4px',
                                                                minWidth: '44px',
                                                            }}>{val}</td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#475569' }}>
                                    <span style={{ color: '#34d399' }}>■</span> Correct predictions &nbsp;
                                    <span style={{ color: '#fb7185' }}>■</span> Misclassifications
                                </div>
                            </div>
                        </div>

                        {/* Summary stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                            {[
                                { label: 'Accuracy', value: '96.8%', color: '#34d399' },
                                { label: 'Macro F1', value: '95.3%', color: '#34d399' },
                                { label: 'AUC-ROC', value: '0.987', color: '#38bdf8' },
                                { label: 'Train Time', value: '2.6 hr', color: '#fbbf24' },
                            ].map((m, i) => (
                                <div key={i} className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk, sans-serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ── MARKET TAB ── */}
                {activeTab === 'market' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Predicted vs Actual Price</div>
                                <div className="section-subtitle" style={{ marginBottom: '16px' }}>LSTM model · RSS-4 weekly price (₹/kg)</div>
                                <ResponsiveContainer width="100%" height={210}>
                                    <AreaChart data={pricePredVsActual}>
                                        <defs>
                                            <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                        <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#475569" tick={{ fontSize: 12 }} domain={[150, 185]} />
                                        <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} formatter={v => `₹${v}`} />
                                        <Area type="monotone" dataKey="actual" stroke="#34d399" fill="url(#actGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#34d399' }} name="Actual" />
                                        <Line type="monotone" dataKey="predicted" stroke="#fb7185" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#fb7185' }} name="LSTM Predicted" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Model Comparison</div>
                                <div className="section-subtitle" style={{ marginBottom: '16px' }}>RMSE · MAE · MAPE across models</div>
                                <ResponsiveContainer width="100%" height={210}>
                                    <BarChart data={marketErrMetrics} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                        <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="model" type="category" stroke="#475569" tick={{ fontSize: 10 }} width={90} />
                                        <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                        <Bar dataKey="RMSE" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="RMSE ₹" />
                                        <Bar dataKey="MAE" fill="#38bdf8" radius={[0, 4, 4, 0]} name="MAE ₹" />
                                        <Bar dataKey="MAPE" fill="#34d399" radius={[0, 4, 4, 0]} name="MAPE %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                            {[
                                { label: 'RMSE (₹/kg)', value: '3.2', desc: 'Root Mean Sq. Error', color: '#a78bfa' },
                                { label: 'MAE (₹/kg)', value: '2.4', desc: 'Mean Abs. Error', color: '#38bdf8' },
                                { label: 'MAPE', value: '1.6%', desc: 'Mean Abs. % Error', color: '#34d399' },
                                { label: 'R² Score', value: '0.943', desc: 'Coefficient of det.', color: '#fbbf24' },
                            ].map((m, i) => (
                                <div key={i} className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk, sans-serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600, marginTop: '4px' }}>{m.label}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{m.desc}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ── RAG TAB ── */}
                {activeTab === 'rag' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>RAG System Radar</div>
                                <div className="section-subtitle" style={{ marginBottom: '4px' }}>6-dimension evaluation · 100-point scale</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <RadarChart data={ragRadar}>
                                        <PolarGrid stroke="rgba(52,211,153,0.1)" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Radar dataKey="score" stroke="#fb7185" fill="#fb7185" fillOpacity={0.15} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div className="section-title" style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Retrieval Method Comparison</div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={ragComparison} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(52,211,153,0.07)" />
                                        <XAxis type="number" domain={[40, 100]} stroke="#475569" tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="method" type="category" stroke="#475569" tick={{ fontSize: 9 }} width={120} />
                                        <Tooltip contentStyle={{ background: '#0d2818', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px', color: '#f1f5f9' }} />
                                        <Bar dataKey="relevance" fill="#fb7185" radius={[0, 4, 4, 0]} name="Relevance %" />
                                        <Bar dataKey="faithfulness" fill="#a78bfa" radius={[0, 4, 4, 0]} name="Faithfulness %" />
                                        <Bar dataKey="human" fill="#34d399" radius={[0, 4, 4, 0]} name="Human Rating %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* RAG dimension cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                            {ragRadar.map((r, i) => (
                                <div key={i} className="glass-card" style={{ padding: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>{r.metric}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185', fontFamily: 'Space Grotesk, sans-serif' }}>{r.score}%</div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${r.score}%`, background: r.score >= 85 ? '#34d399' : r.score >= 75 ? '#fbbf24' : '#fb7185' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </PageLayout>
        </div>
    );
}
