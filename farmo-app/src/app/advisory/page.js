'use client';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';

const ragDocuments = [
    { title: 'Kerala Rubber Board Guidelines 2024', category: 'Policy', pages: 42 },
    { title: 'Rubber Plantation Disease Management Manual', category: 'Crop Health', pages: 128 },
    { title: 'Kerala Agricultural Department Soil Guide', category: 'Soil', pages: 67 },
    { title: 'RRII Research Bulletin: High-Yield Clones', category: 'Agronomy', pages: 55 },
    { title: 'IPM for Rubber Plantations – Kerala', category: 'Pest Management', pages: 89 },
    { title: 'Intercropping Systems – Rubber & Coconut', category: 'Agronomy', pages: 34 },
    { title: 'Tapping Systems & Latex Yield Optimization', category: 'Operations', pages: 76 },
    { title: 'Rubber Price Forecasting Methods', category: 'Market', pages: 28 },
];

const sampleQuestions = [
    'What is the best time to tap rubber trees?',
    'ശീതകാലത്ത് ഇലപ്പൊഴിയൽ രോഗം എങ്ങനെ നിയന്ത്രിക്കാം?',
    'How much urea should I apply for 1 acre of rubber?',
    'RSS-4 ഇന്ന് ഏത് വിലയ്ക്ക് വിൽക്കാം?',
    'Powdery mildew treatment schedule for Kerala',
    'കേരള കാർഷിക ഡിപ്പാർട്ട്മെന്റ് ഇൻഷുറൻസ് പദ്ധതി',
];

const initialMessages = [
    {
        role: 'assistant',
        text: 'നമസ്കാരം! 🌿 I am FARMO Advisory — your AI farming assistant powered by RAG and an LLM fine-tuned on Kerala agricultural data.\n\nI can answer questions in **English or Malayalam** about:\n• Rubber disease management\n• Fertilizer and irrigation schedules\n• Market prices and selling advice\n• Tapping schedule optimization\n• Government schemes and subsidies\n\nHow can I help you today?',
        time: '9:00 PM',
        sources: [],
    }
];

const mockResponses = {
    default: {
        text: 'Based on the **Kerala Rubber Board Guidelines** and current sensor data from your plantation:\n\n**For rubber tapping**, the optimal time is early morning between **5:30–7:30 AM** when temperatures are cool (22–26°C) and humidity is high. This maximizes latex flow and reduces coagulation risk.\n\n**Key recommendations:**\n• Use ½S/2 tapping cut (half spiral, alternate day)\n• Apply Ethephon (2.5%) for yield stimulation on Panel B\n• Avoid tapping 24–48 hours after heavy rain\n• Sanitize tapping knife with 10% bleach solution weekly\n\n📚 *Sources: RRII Bulletin Vol.3, Kerala Rubber Board SOP 2024*',
        sources: ['RRII Research Bulletin: High-Yield Clones', 'Kerala Rubber Board Guidelines 2024'],
    },
    disease: {
        text: '**ശീതകാലത്ത് ഇലപ്പൊഴിയൽ തടയൽ (Preventing Leaf Fall Disease in Winter)**\n\n*Phytophthora meadii* ആണ് ഈ രോഗത്തിന് കാരണം. ഇനിപ്പറയുന്ന നടപടികൾ സ്വീകരിക്കുക:\n\n1. **Bordeaux Mixture 1%** – ഒക്ടോബർ-നവംബർ മാസങ്ങളിൽ 3 തവണ spray ചെയ്യുക\n2. **Metalaxyl 25% WP** – 2 g/L വെള്ളത്തിൽ കലക്കി ഇലകളിൽ spray ചെയ്യുക\n3. **Drainage improvement** – വേരിൽ വെള്ളം കെട്ടി നിൽക്കരുത്\n4. infected ഇലകൾ ശേഖരിച്ച് കത്തിക്കുക\n\n📚 *Sources: IPM for Rubber Plantations – Kerala, p.45*',
        sources: ['IPM for Rubber Plantations – Kerala', 'Rubber Plantation Disease Management Manual'],
    },
    fertilizer: {
        text: 'Based on your IoT soil sensor readings (N: 52 mg/kg, P: 36 mg/kg, K: 62 mg/kg) and the **Kerala Agricultural Department guidelines**:\n\n**Recommended Fertilizer Schedule for 1 Acre:**\n\n| Fertilizer | Quantity | Timing |\n|---|---|---|\n| Urea (46% N) | 22 kg | March & July |\n| Rock Phosphate | 15 kg | June |\n| Muriate of Potash | 18 kg | June & October |\n| Borax | 1 kg | Once annually |\n| Magnesium Sulphate | 2 kg | June |\n\n⚠️ **Current Alert:** Your Boron levels are low. Apply Borax @ 1 kg/acre immediately.\n\n📚 *Sources: Kerala Agricultural Dept Soil Guide, RRII Bulletin*',
        sources: ['Kerala Agricultural Department Soil Guide', 'RRII Research Bulletin: High-Yield Clones'],
    },
    market: {
        text: '**Current Market Analysis (March 4, 2026):**\n\n📍 **Kottayam Market:** RSS-4 @ ₹178/kg (↑ ₹2.50)\n📍 **RRII Cooperative:** Latex 60% @ ₹136/kg\n\n**AI Sell Recommendation:** 🟡 **HOLD for 3–5 days**\n\nReason: Global TOCOM futures indicate a ₹5–10 upward movement expected March 9–12. Thai supply disruption due to monsoon is tightening global supply.\n\n**Expected peak:** ₹185–188/kg by March 10\n\n💡 Tip: Sell via RRII Cooperative to get ₹2–3 premium over open market price.\n\n📚 *Sources: Market Intelligence Agent, TOCOM data feed*',
        sources: ['Rubber Price Forecasting Methods'],
    }
};

function getResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('disease') || lower.includes('ഇലപ്പൊഴിയൽ') || lower.includes('mildew') || lower.includes('pathogen')) return mockResponses.disease;
    if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('soil') || lower.includes('npk')) return mockResponses.fertilizer;
    if (lower.includes('market') || lower.includes('price') || lower.includes('sell') || lower.includes('rss') || lower.includes('വില')) return mockResponses.market;
    return mockResponses.default;
}

export default function AdvisoryPage() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [lang, setLang] = useState('both');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (text) => {
        const q = text || input.trim();
        if (!q) return;
        setInput('');
        const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setMessages(m => [...m, { role: 'user', text: q, time: now }]);
        setThinking(true);
        setTimeout(() => {
            const resp = getResponse(q);
            setThinking(false);
            setMessages(m => [...m, { role: 'assistant', text: resp.text, time: now, sources: resp.sources }]);
        }, 1800 + Math.random() * 1200);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <PageLayout>
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(244,63,94,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.2)' }}>
                        🗣️ Advisory Agent · LLM + RAG
                    </span>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: '8px', lineHeight: 1.1 }}>
                        AI Farm <span style={{ background: 'linear-gradient(135deg, #fb7185, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Advisory</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                        Mistral-7B + RAG · Malayalam &amp; English · 8 Kerala agricultural knowledge bases
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
                    {/* Chat Interface */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>FARMO Advisory</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#34d399' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399' }} />
                                        Online · RAG Active
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['both', 'en', 'ml'].map(l => (
                                    <button key={l} onClick={() => setLang(l)} style={{
                                        padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                                        background: lang === l ? 'rgba(244,63,94,0.15)' : 'transparent',
                                        color: lang === l ? '#fb7185' : '#64748b',
                                        border: lang === l ? '1px solid rgba(244,63,94,0.3)' : '1px solid transparent',
                                        fontWeight: lang === l ? 600 : 400,
                                    }}>
                                        {l === 'both' ? '🌐 Both' : l === 'en' ? '🇬🇧 EN' : '🇮🇳 ML'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '85%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.04)',
                                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        color: '#f1f5f9',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                        {/* Render basic markdown bold */}
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#34d399">$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                                .replace(/📚 \*(.*?)\*/g, '<em style="color:#64748b;font-size:0.78rem">📚 $1</em>')
                                        }} />
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div style={{ maxWidth: '85%', marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {msg.sources.map((s, j) => (
                                                <span key={j} style={{ fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    📄 {s.length > 30 ? s.slice(0, 30) + '…' : s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.68rem', color: '#334155', marginTop: '4px', paddingX: '4px' }}>{msg.time}</div>
                                </div>
                            ))}
                            {thinking && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>🤖</div>
                                    <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                                            <span style={{ fontSize: '0.75rem', color: '#475569', marginLeft: '6px' }}>Querying RAG knowledge base…</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                            {sampleQuestions.slice(0, 4).map((q, i) => (
                                <button key={i} onClick={() => sendMessage(q)} style={{
                                    flexShrink: 0, padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.2)',
                                    background: 'rgba(244,63,94,0.06)', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer',
                                    transition: 'all 0.2s', fontFamily: q.match(/[\u0D00-\u0D7F]/) ? 'Noto Sans Malayalam, sans-serif' : 'inherit',
                                    maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(52,211,153,0.1)', display: 'flex', gap: '10px' }}>
                            <input
                                className="input-field"
                                placeholder="Ask in English or Malayalam… (ഇവിടെ ചോദിക്കൂ)"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                style={{ fontFamily: input.match(/[\u0D00-\u0D7F]/) ? 'Noto Sans Malayalam, sans-serif' : 'inherit' }}
                            />
                            <button className="btn-primary" onClick={() => sendMessage()} disabled={thinking || !input.trim()} style={{ flexShrink: 0, opacity: (thinking || !input.trim()) ? 0.5 : 1 }}>
                                Send ↗
                            </button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                        {/* System Info */}
                        <div className="glass-card" style={{ padding: '18px' }}>
                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem', marginBottom: '12px' }}>🧠 AI System</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'LLM Model', value: 'Mistral-7B Instruct' },
                                    { label: 'Fine-tuning', value: 'LoRA on Kerala data' },
                                    { label: 'RAG Method', value: 'ChromaDB + BM25' },
                                    { label: 'Languages', value: 'English, Malayalam' },
                                    { label: 'Context Window', value: '8K tokens' },
                                    { label: 'Embedding Model', value: 'BGE-M3 multilingual' },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ color: '#475569' }}>{item.label}</span>
                                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RAG Documents */}
                        <div className="glass-card" style={{ padding: '18px', flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem', marginBottom: '12px' }}>📚 Knowledge Base ({ragDocuments.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {ragDocuments.map((doc, i) => (
                                    <div key={i} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500, marginBottom: '3px', lineHeight: 1.3 }}>{doc.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{doc.category}</span>
                                            <span style={{ fontSize: '0.68rem', color: '#334155' }}>{doc.pages} pages</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Voice Input Placeholder */}
                        <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎙️</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>Voice Input</div>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '12px' }}>Malayalam voice support via Whisper ASR</div>
                            <button style={{
                                width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed rgba(244,63,94,0.25)',
                                background: 'rgba(244,63,94,0.06)', color: '#fb7185', cursor: 'pointer', fontSize: '0.82rem',
                                transition: 'all 0.2s',
                            }}>
                                🎙 Tap to speak (Coming soon)
                            </button>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </div>
    );
}
