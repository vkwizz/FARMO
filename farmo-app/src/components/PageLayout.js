'use client';

export default function PageLayout({ children, sidebarWidth = 240 }) {
    return (
        <div style={{
            marginLeft: sidebarWidth,
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at 20% 20%, rgba(13,40,24,0.8) 0%, #061208 60%)',
            transition: 'margin-left 0.3s ease',
        }}>
            {/* Background grid */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: `linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '32px', maxWidth: '1400px' }}>
                {children}
            </div>
        </div>
    );
}
