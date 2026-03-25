'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);
    const { lang, setLang, t, languages } = useLanguage();

    const navItems = [
        { href: '/', labelKey: 'dashboard', icon: '🏡' },
        { href: '/crop-health', labelKey: 'cropHealth', icon: '🌿' },
        { href: '/resource', labelKey: 'resources', icon: '💧' },
        { href: '/advisory', labelKey: 'advisory', icon: '🤖' },
        { href: '/orchestration', labelKey: 'orchestration', icon: '🔀' },
        { href: '/evaluation', labelKey: 'evaluation', icon: '📊' },
        { href: '/edge', labelKey: 'edgeDeploy', icon: '🖥️' },
    ];

    const statusItems = [
        { labelKey: 'cropAI', color: '#34d399' },
        { labelKey: 'marketFeed', color: '#34d399' },
        { labelKey: 'weatherAPI', color: '#fbbf24' },
        { labelKey: 'ragEngine', color: '#34d399' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = languages.find(l => l.code === lang);

    return (
        <aside style={{
            width: collapsed ? '72px' : '240px',
            background: 'linear-gradient(180deg, #0d2818 0%, #061208 100%)',
            borderRight: '1px solid rgba(52,211,153,0.12)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'visible',
        }}>
            {/* Logo + Globe */}
            <div style={{
                padding: '16px 16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid rgba(52,211,153,0.1)',
                minHeight: '72px',
                overflow: 'visible',
                position: 'relative',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #059669, #34d399)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                    boxShadow: '0 4px 15px rgba(52,211,153,0.3)',
                }}>🌿</div>

                {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>FARMO</div>
                        <div style={{ fontSize: '0.6rem', color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Farm Platform</div>
                    </div>
                )}

                {/* Globe Language Switcher */}
                <div ref={langRef} style={{ position: 'relative', flexShrink: 0, marginLeft: collapsed ? 'auto' : '0' }}>
                    <button
                        onClick={() => setLangOpen(!langOpen)}
                        title={t.selectLanguage}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: langOpen ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.08)',
                            border: '1px solid rgba(52,211,153,0.25)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = langOpen ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.08)'}
                    >
                        🌐
                        {/* Active lang dot */}
                        <span style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#34d399',
                            border: '1.5px solid #0d2818',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '5px',
                            color: '#061208',
                            fontWeight: 700,
                        }}>
                            {lang.toUpperCase().slice(0, 2)}
                        </span>
                    </button>

                    {/* Dropdown */}
                    {langOpen && (
                        <div style={{
                            position: 'fixed',
                            top: '68px',
                            left: collapsed ? '80px' : '248px',
                            background: 'linear-gradient(160deg, #0f3621 0%, #0d2818 100%)',
                            border: '1px solid rgba(52,211,153,0.25)',
                            borderRadius: '14px',
                            padding: '8px',
                            minWidth: '200px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(52,211,153,0.1)',
                            zIndex: 9999,
                            backdropFilter: 'blur(20px)',
                            animation: 'langFadeIn 0.18s ease',
                        }}>
                            <div style={{
                                fontSize: '0.65rem',
                                color: '#34d399',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                padding: '4px 8px 8px',
                                borderBottom: '1px solid rgba(52,211,153,0.1)',
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}>
                                🌐 {t.selectLanguage}
                            </div>
                            {languages.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '9px 12px',
                                        background: lang === l.code ? 'rgba(52,211,153,0.15)' : 'transparent',
                                        border: lang === l.code ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
                                        borderRadius: '9px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '3px',
                                        transition: 'all 0.15s ease',
                                        color: lang === l.code ? '#34d399' : '#94a3b8',
                                    }}
                                    onMouseEnter={e => { if (lang !== l.code) { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                                    onMouseLeave={e => { if (lang !== l.code) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                                >
                                    <span style={{ fontSize: '16px' }}>{l.flag}</span>
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: lang === l.code ? 700 : 500, lineHeight: 1.2 }}>{l.nativeLabel}</div>
                                        <div style={{ fontSize: '0.68rem', color: lang === l.code ? 'rgba(52,211,153,0.7)' : '#475569', lineHeight: 1 }}>{l.label}</div>
                                    </div>
                                    {lang === l.code && (
                                        <span style={{ marginLeft: 'auto', color: '#34d399', fontSize: '14px' }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', overflowX: 'hidden' }}>
                {navItems.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: active ? '#34d399' : '#94a3b8',
                            background: active ? 'rgba(52,211,153,0.12)' : 'transparent',
                            border: active ? '1px solid rgba(52,211,153,0.25)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                        }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(52,211,153,0.06)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                        >
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                            {!collapsed && <span style={{ fontWeight: active ? 600 : 400, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t[item.labelKey]}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* System Status */}
            {!collapsed && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(52,211,153,0.1)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.systemStatus}</div>
                    {statusItems.map(s => (
                        <div key={s.labelKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t[s.labelKey]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    margin: '8px',
                    padding: '8px',
                    background: 'rgba(52,211,153,0.06)',
                    border: '1px solid rgba(52,211,153,0.12)',
                    borderRadius: '8px',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                }}
            >
                {collapsed ? '→' : '←'}
            </button>

            <style>{`
                @keyframes langFadeIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </aside>
    );
}
