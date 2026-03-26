'use client';

export default function StatCard({ icon, label, value, sub, color = 'emerald', trend }) {
    const colors = {
        emerald: '#006d44',
        amber: '#f59e0b',
        sky: '#0ea5e9',
        rose: '#f43f5e',
        violet: '#8b5cf6',
    };
    const c = colors[color] || color;

    return (
        <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Glow orb */}
            <div style={{
                position: 'absolute', top: '-10px', right: '-10px',
                width: '100px', height: '100px', borderRadius: '50%',
                background: c, opacity: 0.05, filter: 'blur(30px)',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                        {value}
                    </div>
                    {sub && <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '8px', fontWeight: 500 }}>{sub}</div>}
                    {trend !== undefined && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            marginTop: '12px', fontSize: '0.8rem', fontWeight: 700,
                            color: trend > 0 ? '#10b981' : '#f43f5e',
                            background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '20px',
                        }}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: `rgba(${hexToRgb(c)}, 0.1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: `0 8px 20px rgba(${hexToRgb(c)}, 0.08)`,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}
