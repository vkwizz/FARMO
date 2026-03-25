import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';

const notes = [
    {
        time: 'May 24 · 5:43pm',
        text: 'Excellent harvest, the grapes have a rich flavor and aroma',
        img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=200&q=60',
    },
    {
        time: 'May 24 · 5:43pm',
        text: 'Excellent harvest, the grapes have a rich flavor and aroma',
        img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=200&q=60',
    },
    {
        time: 'May 24 · 5:43pm',
        text: 'Excellent harvest, the grapes have a rich flavor and aroma',
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=60',
    },
    {
        time: 'May 24 · 5:43pm',
        text: 'Excellent harvest, the grapes have a rich flavor and aroma',
        img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=200&q=60',
    },
];

import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WeatherScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = React.useState(true);
    const [weather, setWeather] = React.useState({
        temp: '--°C',
        location: 'Fetching...',
        humidity: '--%',
        sky: 'Cloudy',
        icon: '🌤️'
    });

    React.useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            fetchWeather(loc.coords.latitude, loc.coords.longitude);
        })();
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
            const data = await res.json();
            
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const geoData = await geoRes.json();
            const cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Local Area';

            const codes = { 0: 'Clear', 1: 'Clear', 2: 'Cloudy', 3: 'Overcast', 61: 'Rainy', 80: 'Rainy' };
            const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 61: '🌦️', 80: '🌧️' };

            setWeather({
                temp: `${Math.round(data.current.temperature_2m)}°C`,
                location: `${cityName}, ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
                humidity: `Humidity ${data.current.relative_humidity_2m}%`,
                sky: codes[data.current.weather_code] || 'Cloudy',
                icon: icons[data.current.weather_code] || '☁️'
            });
            setLoading(false);
        } catch (e) { console.error(e); }
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0E5B38', '#0C4A31']} style={styles.bg} />
            <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.title}>Todays Weather</Text>
                        <TouchableOpacity style={styles.langBtn} activeOpacity={0.7}>
                            <Text style={{ fontSize: 20 }}>🌐</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weatherBox}>
                        <View>
                            <Text style={styles.location}>{weather.location}</Text>
                            <Text style={styles.temp}>{weather.temp}</Text>
                            <Text style={styles.meta}>{weather.humidity}</Text>
                            <Text style={styles.subtext}>Today is a good day to monitor your crops.</Text>
                        </View>
                        <View style={styles.cloudBubble}>
                            <Text style={{ fontSize: 30 }}>{weather.icon}</Text>
                            <Text style={styles.cloudText}>{weather.sky}</Text>
                        </View>
                    </View>

                    <View style={styles.notesHeader}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <TouchableOpacity>
                            <Text style={styles.more}>⋮</Text>
                        </TouchableOpacity>
                    </View>

                    {notes.map((n, i) => (
                        <View key={i} style={styles.noteRow}>
                            <Image source={{ uri: n.img }} style={styles.noteImg} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.noteTime}>{n.time}</Text>
                                <Text style={styles.noteText}>{n.text}</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn}>
                        <Text style={{ fontSize: 18, color: COLORS.white }}>＋</Text>
                        <Text style={styles.addText}>Add New Note</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0C4A31' },
    bg: { ...StyleSheet.absoluteFillObject },
    scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOW.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    langBtn: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: COLORS.primaryPale,
        alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textDark },
    weatherBox: {
        backgroundColor: '#0E5B38',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    location: { color: '#D4E8DA', fontSize: FONTS.sizes.xs },
    temp: { color: COLORS.white, fontSize: 40, fontWeight: '900', marginVertical: 4 },
    meta: { color: '#C7E0CD', fontSize: FONTS.sizes.sm, marginBottom: 4 },
    subtext: { color: '#D4E8DA', fontSize: FONTS.sizes.xs },
    cloudBubble: {
        backgroundColor: COLORS.white,
        width: 90,
        height: 90,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.sm,
    },
    cloudText: { marginTop: 4, fontSize: FONTS.sizes.xs, color: COLORS.textGray, fontWeight: '700' },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    notesTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textDark },
    more: { fontSize: 20, color: COLORS.textGray },
    noteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        gap: SPACING.sm,
    },
    noteImg: { width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
    noteTime: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textDark },
    noteText: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, lineHeight: 18 },
    addBtn: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
        paddingVertical: 14,
        gap: 6,
    },
    addText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '700' },
});
