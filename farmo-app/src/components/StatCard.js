'use client';

export default function StatCard({ icon, label, value, sub, color = '#34d399', trend }) {
    const colors = {
        emerald: '#34d399',
        amber: '#fbbf24',
        sky: '#38bdf8',
        rose: '#fb7185',
        violet: '#a78bfa',
    };
    const c = colors[color] || color;

    return (
        <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Glow orb */}
            <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: c, opacity: 0.08, filter: 'blur(20px)',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
                        {value}
                    </div>
                    {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>{sub}</div>}
                    {trend && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            marginTop: '8px', fontSize: '0.78rem', fontWeight: 600,
                            color: trend > 0 ? '#34d399' : '#fb7185',
                        }}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            <span style={{ color: '#64748b', fontWeight: 400 }}> vs last week</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `rgba(${hexToRgb(c)}, 0.12)`,
                    border: `1px solid rgba(${hexToRgb(c)}, 0.25)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
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
