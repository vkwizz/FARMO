'use client';

export default function PageLayout({ children, sidebarWidth = 240 }) {
    return (
        <div style={{
            marginLeft: sidebarWidth,
            minHeight: '100vh',
            background: 'var(--bg-offwhite)',
            transition: 'margin-left 0.3s ease',
        }}>
            {/* Very subtle background grid */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                backgroundImage: `linear-gradient(rgba(0,109,68,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,109,68,0.02) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '32px', maxWidth: '1400px' }}>
                {children}
            </div>
        </div>
    );
}
