'use client';
import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';

const steps = [
    {
        id: 1, from: 'Farmer', to: 'Advisory Agent',
        label: 'User Question (English / Malayalam)',
        detail: 'Farmer asks a question via chat or voice (Whisper ASR). Advisory Agent receives raw query.',
        icon: '🧑‍🌾', color: '#34d399',
    },
    {
        id: 2, from: 'Advisory Agent', to: 'Router',
        label: 'Intent Classification & Routing',
        detail: 'LLM classifies intent: disease query → Crop Agent; price query → Market Agent; weather query → Weather Agent; resource → Resource Agent. Uses LangGraph StateGraph.',
        icon: '🔀', color: '#38bdf8',
    },
    {
        id: 3, from: 'Router', to: 'Parallel Agents',
        label: 'Parallel Agent Invocation',
        detail: 'LangGraph triggers relevant agents concurrently. Each agent executes its specialized pipeline independently.',
        icon: '⚡', color: '#fbbf24',
    },
    {
        id: 4, from: 'Sub-Agents', to: 'Advisory Agent',
        label: 'Agent Results Collected',
        detail: 'Each sub-agent returns structured JSON. Advisory Agent collects and validates all responses with timeout handling.',
        icon: '📥', color: '#a78bfa',
    },
    {
        id: 5, from: 'Advisory Agent + RAG', to: 'LLM',
        label: 'RAG Retrieval + LLM Synthesis',
        detail: 'ChromaDB retrieves relevant document chunks. Advisory Agent feeds context + agent outputs to Mistral-7B for final answer generation.',
        icon: '🧠', color: '#fb7185',
    },
    {
        id: 6, from: 'LLM', to: 'Farmer',
        label: 'Multilingual Response Delivered',
        detail: 'Final advice sent in Malayalam or English with source citations. TTS converts to audio if voice mode is active.',
        icon: '📢', color: '#34d399',
    },
];

const agents = [
    {
        name: 'Crop Health Agent', icon: '🔬', color: '#34d399',
        role: 'Specialist',
        input: 'Leaf image / zone query',
        output: 'Disease name, confidence, treatment JSON',
        model: 'EfficientNet-B4 + ViT',
        tools: ['image_classifier', 'disease_lookup', 'treatment_db'],
    },
    {
        name: 'Resource Agent', icon: '💧', color: '#38bdf8',
        role: 'Specialist',
        input: 'Sensor readings, zone ID',
        output: 'Irrigation schedule, fertilizer dose JSON',
        model: 'Rule-based + Optimization',
        tools: ['iot_reader', 'soil_optimizer', 'fao_calculator'],
    },
    {
        name: 'Weather Agent', icon: '⛅', color: '#fbbf24',
        role: 'Specialist',
        input: 'Location, date range',
        output: 'Forecast JSON + tapping recommendation',
        model: 'OpenWeather API + Statistical',
        tools: ['weather_api', 'rainfall_predictor', 'tapping_scheduler'],
    },
    {
        name: 'Market Agent', icon: '📈', color: '#a78bfa',
        role: 'Specialist',
        input: 'Grade type, quantity, date',
        output: 'Price prediction, buy/sell signal JSON',
        model: 'LSTM Forecaster',
        tools: ['price_scraper', 'lstm_predictor', 'market_ranker'],
    },
    {
        name: 'Advisory Agent', icon: '🤖', color: '#fb7185',
        role: 'Orchestrator',
        input: 'User query + sub-agent outputs',
        output: 'Natural language advice (EN/ML)',
        model: 'Mistral-7B + LoRA + RAG',
        tools: ['intent_router', 'chroma_retriever', 'response_generator', 'tts'],
    },
];

const frameworks = [
    {
        name: 'LangGraph', chosen: true, icon: '🔗',
        pros: ['Stateful agent graphs', 'Conditional routing', 'Parallel execution', 'Built-in memory', 'Native LangChain integration'],
        why: 'Best for our sequential + parallel hybrid workflow. StateGraph lets us model the exact advisory → sub-agents → synthesis pattern.',
    },
    {
        name: 'CrewAI', chosen: false, icon: '🚢',
        pros: ['Role-based agents', 'Easy setup', 'Task delegation'],
        why: 'Good for sequential role-based tasks but less flexible for dynamic parallel agent invocation.',
    },
    {
        name: 'AutoGen', chosen: false, icon: '🔄',
        pros: ['Multi-agent conversations', 'Code execution', 'Microsoft backed'],
        why: 'Excellent for coding tasks, but more complex to configure for domain-specific agricultural agents.',
    },
];

const codeSnippet = `# FARMO Agent Orchestration with LangGraph
from langgraph.graph import StateGraph, END
from langchain_community.llms import HuggingFacePipeline
from typing import TypedDict, Optional

class FARMOState(TypedDict):
    user_query: str
    intent: str                      # "disease" | "market" | "weather" | "resource"
    crop_result: Optional[dict]
    market_result: Optional[dict]
    weather_result: Optional[dict]
    resource_result: Optional[dict]
    rag_context: str
    final_response: str

# ── Node Definitions ──────────────────────────────────────
def intent_classifier(state: FARMOState) -> FARMOState:
    """Advisory Agent: classify user intent using LLM"""
    prompt = f"Classify intent of: '{state['user_query']}' → disease|market|weather|resource|general"
    state["intent"] = llm.invoke(prompt).strip()
    return state

def crop_health_agent(state: FARMOState) -> FARMOState:
    """Invoke CNN disease classifier"""
    if state["intent"] in ["disease", "general"]:
        state["crop_result"] = crop_model.predict(state["user_query"])
    return state

def weather_agent(state: FARMOState) -> FARMOState:
    """Fetch weather data + tapping recommendation"""
    if state["intent"] in ["weather", "general"]:
        state["weather_result"] = weather_api.get_forecast(location="TVM")
    return state

def market_agent(state: FARMOState) -> FARMOState:
    """LSTM price prediction + sell signal"""
    if state["intent"] in ["market", "general"]:
        state["market_result"] = lstm_model.predict_price(grade="RSS-4")
    return state

def rag_retrieval(state: FARMOState) -> FARMOState:
    """Retrieve relevant chunks from ChromaDB"""
    docs = vectorstore.similarity_search(state["user_query"], k=4)
    state["rag_context"] = "\\n".join([d.page_content for d in docs])
    return state

def advisory_synthesizer(state: FARMOState) -> FARMOState:
    """Final Mistral-7B response generation with full context"""
    context = f"""
    User Query: {state['user_query']}
    Crop Health: {state.get('crop_result', 'N/A')}
    Weather: {state.get('weather_result', 'N/A')}
    Market: {state.get('market_result', 'N/A')}
    Knowledge Base: {state['rag_context']}
    """
    state["final_response"] = mistral_llm.invoke(context)
    return state

# ── Build LangGraph ───────────────────────────────────────
workflow = StateGraph(FARMOState)
workflow.add_node("classify",    intent_classifier)
workflow.add_node("crop_agent",  crop_health_agent)
workflow.add_node("weather",     weather_agent)
workflow.add_node("market",      market_agent)
workflow.add_node("rag",         rag_retrieval)
workflow.add_node("synthesize",  advisory_synthesizer)

workflow.set_entry_point("classify")

# Parallel execution after classification
workflow.add_edge("classify",   "crop_agent")
workflow.add_edge("classify",   "weather")
workflow.add_edge("classify",   "market")

# All converge to RAG then synthesis
workflow.add_edge("crop_agent", "rag")
workflow.add_edge("weather",    "rag")
workflow.add_edge("market",     "rag")
workflow.add_edge("rag",        "synthesize")
workflow.add_edge("synthesize", END)

app_graph = workflow.compile()

# ── Invoke ────────────────────────────────────────────────
result = app_graph.invoke({
    "user_query": "Is it safe to tap today? I see white powder on leaves."
})
print(result["final_response"])`;

export default function OrchestrationPage() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <PageLayout>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(14,165,233,0.1)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.2)' }}>
                        🔀 Agent Orchestration
                    </span>
                    <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginTop: '8px', lineHeight: 1.1 }}>
                        Multi-Agent <span style={{ background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Communication Framework</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                        LangGraph StateGraph · Parallel agent execution · Advisory orchestrator pattern
                    </p>
                </div>

                {/* Framework selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {frameworks.map((f, i) => (
                        <div key={i} className="glass-card" style={{
                            padding: '20px',
                            border: f.chosen ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.06)',
                            background: f.chosen ? 'rgba(52,211,153,0.06)' : undefined,
                            position: 'relative',
                        }}>
                            {f.chosen && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>✓ CHOSEN</span>
                                </div>
                            )}
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
                            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: f.chosen ? '#34d399' : '#f1f5f9', fontSize: '1rem', marginBottom: '8px' }}>{f.name}</div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                                {f.pros.map((p, j) => (
                                    <li key={j} style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '6px' }}>
                                        <span style={{ color: '#34d399' }}>→</span> {p}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, fontStyle: 'italic', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {f.why}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Workflow Steps */}
                <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div className="section-title" style={{ fontSize: '1.2rem' }}>Agent Communication Workflow</div>
                        <div className="section-subtitle">Step-by-step orchestration via LangGraph StateGraph</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                {/* Timeline */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '48px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        background: `rgba(${hexToRgb(step.color)}, 0.12)`,
                                        border: `2px solid rgba(${hexToRgb(step.color)}, 0.4)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px', zIndex: 1,
                                    }}>
                                        {step.icon}
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div style={{ width: '2px', flex: 1, minHeight: '28px', background: `linear-gradient(to bottom, rgba(${hexToRgb(step.color)},0.4), rgba(${hexToRgb(steps[i + 1].color)},0.15))` }} />
                                    )}
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? '20px' : '0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{step.label}</span>
                                        <span style={{ fontSize: '0.72rem', color: step.color, background: `rgba(${hexToRgb(step.color)}, 0.1)`, padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                            Step {step.id}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
                                        <strong style={{ color: '#475569' }}>{step.from}</strong> → <strong style={{ color: '#475569' }}>{step.to}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>{step.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parallel execution diagram */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="section-title" style={{ fontSize: '1.1rem' }}>Parallel Execution Pattern</div>
                        <div className="section-subtitle">Sub-agents run concurrently — total latency = slowest agent, not sum of all</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {/* Advisory center */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251,113,133,0.2), rgba(139,92,246,0.2))', border: '2px solid rgba(251,113,133,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 8px' }}>🤖</div>
                            <div style={{ fontSize: '0.78rem', color: '#fb7185', fontWeight: 600 }}>Advisory</div>
                            <div style={{ fontSize: '0.68rem', color: '#475569' }}>Orchestrator</div>
                        </div>

                        {/* Arrow + parallel block */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <div style={{ fontSize: '1.2rem', color: '#38bdf8' }}>→</div>
                            <div style={{ fontSize: '0.7rem', color: '#334155', background: 'rgba(14,165,233,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(14,165,233,0.15)' }}>parallel</div>
                        </div>

                        {/* 4 sub-agents */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                            {agents.slice(0, 4).map((a, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px',
                                    background: `rgba(${hexToRgb(a.color)}, 0.07)`,
                                    border: `1px solid rgba(${hexToRgb(a.color)}, 0.2)`,
                                    fontSize: '0.8rem',
                                }}>
                                    <span>{a.icon}</span>
                                    <span style={{ color: a.color, fontWeight: 600 }}>{a.name}</span>
                                    <span style={{ color: '#334155', fontSize: '0.7rem' }}>→ {a.output.split(',')[0]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Converge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <div style={{ fontSize: '1.2rem', color: '#a78bfa' }}>→</div>
                            <div style={{ fontSize: '0.7rem', color: '#334155', background: 'rgba(139,92,246,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(139,92,246,0.15)' }}>merge</div>
                        </div>

                        {/* RAG + Synthesis */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>📚</div>
                                <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>ChromaDB RAG</div>
                            </div>
                            <div style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', marginBottom: '4px' }}>🧠</div>
                                <div style={{ fontSize: '0.78rem', color: '#fb7185', fontWeight: 600 }}>Mistral-7B</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '1.2rem', color: '#34d399', flexShrink: 0 }}>→</div>

                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 8px' }}>🧑‍🌾</div>
                            <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Farmer</div>
                            <div style={{ fontSize: '0.68rem', color: '#475569' }}>EN / ML</div>
                        </div>
                    </div>
                </div>

                {/* LangGraph Code */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <div className="section-title" style={{ fontSize: '1.1rem' }}>LangGraph Implementation</div>
                            <div className="section-subtitle">Python code for the FARMO orchestration graph</div>
                        </div>
                        <span className="badge badge-success">Production Code</span>
                    </div>
                    <pre style={{
                        background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px',
                        border: '1px solid rgba(52,211,153,0.1)', overflowX: 'auto',
                        fontSize: '0.78rem', lineHeight: 1.7, color: '#94a3b8',
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                        whiteSpace: 'pre', maxHeight: '500px', overflowY: 'auto',
                    }}>
                        {codeSnippet.split('\n').map((line, i) => {
                            let color = '#94a3b8';
                            if (line.trim().startsWith('#')) color = '#64748b';
                            else if (line.includes('def ')) color = '#38bdf8';
                            else if (line.includes('workflow.') || line.includes('app_graph')) color = '#34d399';
                            else if (line.includes('class ') || line.includes('TypedDict')) color = '#a78bfa';
                            else if (line.includes('from ') || line.includes('import ')) color = '#fbbf24';
                            else if (line.includes('"') || line.includes("'")) {
                                return <span key={i} style={{ display: 'block' }}><span style={{ color }}>{line.replace(/(".*?"|'.*?')/g, m => `\x1b\x1b${m}`)}</span></span>;
                            }
                            return <span key={i} style={{ display: 'block', color }}>{line}</span>;
                        })}
                    </pre>
                </div>

                {/* Agent capability table */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div className="section-title" style={{ fontSize: '1.1rem' }}>Agent Capability Matrix</div>
                        <div className="section-subtitle">Tools and data contracts for each agent</div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(52,211,153,0.1)' }}>
                                    {['Agent', 'Role', 'Input', 'Output', 'Model / Approach', 'Tools'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((a, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px', color: a.color, fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{a.icon} {a.name}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span className={`badge badge-${a.role === 'Orchestrator' ? 'violet' : 'info'}`} style={{ fontSize: '0.68rem' }}>{a.role}</span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.78rem' }}>{a.input}</td>
                                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.78rem' }}>{a.output}</td>
                                        <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '0.78rem' }}>{a.model}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {a.tools.map(t => (
                                                    <code key={t} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.04)', color: '#64748b', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</code>
                                                ))}
                                            </div>
                                        </td>
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

function hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return '52,211,153';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}
