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
        { labelKey: 'cropAI', color: '#006d44' },
        { labelKey: 'marketFeed', color: '#006d44' },
        { labelKey: 'weatherAPI', color: '#fbbf24' },
        { labelKey: 'ragEngine', color: '#006d44' },
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
            background: 'var(--bg-white)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.02)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'visible',
        }} className="sidebar-container">
            {/* Logo + Globe */}
            <div style={{
                padding: '16px 16px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                minHeight: '72px',
                overflow: 'visible',
                position: 'relative',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #006d44, #22c55e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0,109,68,0.2)',
                }}>🌿</div>

                {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-green)', letterSpacing: '-0.02em' }}>FARMO</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>Agriculture AI</div>
                    </div>
                )}

                {/* Globe Language Switcher */}
                <div ref={langRef} style={{ position: 'relative', flexShrink: 0, marginLeft: collapsed ? 'auto' : '0' }}>
                    <button
                        onClick={() => setLangOpen(!langOpen)}
                        title={t.selectLanguage}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: langOpen ? 'rgba(0,109,68,0.1)' : 'var(--gray-50)',
                            border: '1px solid rgba(0,109,68,0.15)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                        }}
                    >
                        🌐
                        <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'var(--primary-green)',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '6px',
                            color: 'white',
                            fontWeight: 800,
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
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '16px',
                            padding: '8px',
                            minWidth: '220px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                            zIndex: 9999,
                            backdropFilter: 'blur(20px)',
                            animation: 'langFadeIn 0.18s ease',
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--primary-green)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                padding: '8px 12px',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                marginBottom: '6px',
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
                                        padding: '10px 12px',
                                        background: lang === l.code ? 'rgba(0,109,68,0.05)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '2px',
                                        transition: 'all 0.15s ease',
                                        color: lang === l.code ? 'var(--primary-green)' : 'var(--gray-600)',
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{l.flag}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: lang === l.code ? 700 : 500 }}>{l.nativeLabel}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{l.label}</div>
                                    </div>
                                    {lang === l.code && <span style={{ color: 'var(--primary-green)' }}>✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', overflowX: 'hidden' }}>
                {navItems.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 14px',
                            borderRadius: '16px',
                            textDecoration: 'none',
                            color: active ? 'var(--primary-green)' : 'var(--gray-600)',
                            background: active ? 'rgba(0,109,68,0.05)' : 'transparent',
                            border: active ? '1px solid rgba(0,109,68,0.1)' : '1px solid transparent',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            whiteSpace: 'nowrap',
                        }} className={active ? "nav-link active" : "nav-link"}>
                            <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                            {!collapsed && <span style={{ fontWeight: active ? 700 : 500, fontSize: '0.95rem' }}>{t[item.labelKey]}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* System Status */}
            {!collapsed && (
                <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t.systemStatus}</div>
                    {statusItems.map(s => (
                        <div key={s.labelKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{t[s.labelKey]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    margin: '12px',
                    padding: '10px',
                    background: 'var(--gray-50)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '12px',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {collapsed ? '→' : '←'}
            </button>

            <style>{`
                @keyframes langFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .sidebar-container {
                        width: 94% !important;
                        height: 72px !important;
                        bottom: 20px !important;
                        top: auto !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        flex-direction: row !important;
                        border-radius: 20px !important;
                        border: 1px solid rgba(255,255,255,0.9) !important;
                        background: rgba(255, 255, 255, 0.85) !important;
                        backdrop-filter: blur(20px) !important;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.12) !important;
                        padding: 0 10px !important;
                    }

                    .sidebar-container nav {
                        flex-direction: row !important;
                        justify-content: space-around !important;
                        padding: 0 !important;
                        gap: 0 !important;
                        width: 100% !important;
                    }

                    .sidebar-container div:first-child,
                    .sidebar-container div:nth-child(2),
                    .sidebar-container div:nth-child(3),
                    .sidebar-container div:last-of-type,
                    .sidebar-container > button {
                        display: none !important;
                    }
                    
                    .nav-link {
                         padding: 8px !important;
                         flex-direction: column !important;
                         gap: 4px !important;
                         font-size: 0.65rem !important;
                         align-items: center !important;
                         flex: 1 !important;
                         background: transparent !important;
                         border: none !important;
                    }
                    
                    .nav-link.active {
                        color: var(--primary-green) !important;
                    }
                }
            `}</style>
        </aside>
    );
}
