import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

export function Card({ children, style, onPress }) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
        <Wrapper
            onPress={onPress}
            activeOpacity={0.85}
            style={[styles.card, style]}
        >
            {children}
        </Wrapper>
    );
}

export function KPICard({ icon, label, value, sub, color, trend }) {
    const c = color || COLORS.primary;
    return (
        <View style={[styles.kpiCard, { borderLeftColor: c, borderLeftWidth: 4 }]}>
            <View style={[styles.kpiIcon, { backgroundColor: `${c}18` }]}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.kpiLabel}>{label}</Text>
                <Text style={[styles.kpiValue, { color: c }]}>{value}</Text>
                {sub && <Text style={styles.kpiSub}>{sub}</Text>}
            </View>
            {trend !== undefined && (
                <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: trend > 0 ? COLORS.success : COLORS.danger }}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </Text>
                </View>
            )}
        </View>
    );
}

export function Badge({ label, type = 'success' }) {
    const map = {
        success: { bg: '#E8F5E9', text: COLORS.success },
        warning: { bg: '#FFF3E0', text: COLORS.warning },
        danger: { bg: '#FFEBEE', text: COLORS.danger },
        info: { bg: '#E3F2FD', text: COLORS.info },
        yellow: { bg: '#FFFDE7', text: COLORS.accentDark },
    };
    const s = map[type] || map.success;
    return (
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
        </View>
    );
}

export function SectionHeader({ title, sub, action, onAction }) {
    return (
        <View style={styles.sectionHeader}>
            <View>
                <Text style={styles.sectionTitle}>{title}</Text>
                {sub && <Text style={styles.sectionSub}>{sub}</Text>}
            </View>
            {action && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={styles.sectionAction}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function Button({ label, onPress, variant = 'primary', icon, disabled }) {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isWarning = variant === 'warning';
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={[
                styles.btn,
                isPrimary && styles.btnPrimary,
                isOutline && styles.btnOutline,
                isWarning && styles.btnWarning,
                disabled && { opacity: 0.45 },
            ]}
        >
            {icon && <Text style={{ marginRight: 6, fontSize: 16 }}>{icon}</Text>}
            <Text style={[
                styles.btnText,
                isPrimary && { color: COLORS.white },
                isOutline && { color: COLORS.primary },
                isWarning && { color: COLORS.white },
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOW.card,
    },
    kpiCard: {
        backgroundColor: COLORS.surfaceCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        ...SHADOW.card,
    },
    kpiIcon: {
        width: 44, height: 44, borderRadius: RADIUS.sm,
        alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
    },
    kpiLabel: {
        fontSize: FONTS.sizes.xs, color: COLORS.textLight, fontWeight: '500',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
    },
    kpiValue: {
        fontSize: FONTS.sizes.xl, fontWeight: '800', letterSpacing: -0.5,
    },
    kpiSub: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 1 },
    trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
    badge: {
        paddingHorizontal: SPACING.sm, paddingVertical: 3,
        borderRadius: RADIUS.full, alignSelf: 'flex-start',
    },
    badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-end', marginBottom: SPACING.sm, marginTop: SPACING.sm,
    },
    sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textDark },
    sectionSub: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
    sectionAction: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
    btn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: RADIUS.md, paddingVertical: 13, paddingHorizontal: SPACING.lg,
    },
    btnPrimary: { backgroundColor: COLORS.primary },
    btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
    btnWarning: { backgroundColor: COLORS.accent },
    btnText: { fontSize: FONTS.sizes.base, fontWeight: '700' },
    divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.sm },
});
