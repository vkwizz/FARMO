import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: "your_groq_api_key_here",
    dangerouslyAllowBrowser: true
});

const PRIMARY_IOT = 'https://rubber-chatbot-api.onrender.com/data';
const FALLBACK_IOT = 'http://10.124.244.29:10000/data';
const PRIMARY_DISEASE = 'https://rubber-chatbot-api.onrender.com/latest_detection';
const FALLBACK_DISEASE = 'http://10.124.244.29:10000/latest_detection';

export default function WeatherScreen() {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    const [weather, setWeather] = useState({
        temp: '--', humidity: '--', sky: 'Fetching...', icon: '🌤️', location: 'Fetching...',
        wind: '--', pressure: '--', precipitation: '--'
    });

    const [iot, setIot] = useState({
        soil: '--', temperature: '--', humidity: '--', light: '--', time: '...'
    });

    const [disease, setDisease] = useState({
        disease: 'No recent scan', confidence: '--', treatment: '--'
    });

    const [report, setReport] = useState(null);
    const [reportTime, setReportTime] = useState(null);

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        setRefreshing(true);
        setDataReady(false);
        await Promise.all([fetchWeather(), fetchIoT(), fetchDisease()]);
        setDataReady(true);
        setRefreshing(false);
    };

    const fetchWeather = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let loc = await Location.getCurrentPositionAsync({});
            const { latitude: lat, longitude: lon } = loc.coords;

            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,precipitation&timezone=auto`
            );
            const data = await res.json();

            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                headers: { 'User-Agent': 'FARMO-App' }
            });
            const geoData = await geoRes.json();
            const city = geoData.address.suburb || geoData.address.city || geoData.address.town || 'Local Area';

            const codes = { 0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 61: 'Slight Rain', 63: 'Moderate Rain', 80: 'Rain Showers' };
            const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 61: '🌦️', 63: '🌧️', 80: '🌧️' };
            const c = data.current;

            setWeather({
                temp: `${Math.round(c.temperature_2m)}°C`,
                humidity: `${c.relative_humidity_2m}%`,
                sky: codes[c.weather_code] || 'Cloudy',
                icon: icons[c.weather_code] || '☁️',
                location: city,
                wind: `${c.wind_speed_10m} m/s`,
                pressure: `${c.surface_pressure} hPa`,
                precipitation: `${c.precipitation} mm`
            });
        } catch (e) { console.error('Weather error:', e); }
    };

    const fetchIoT = async () => {
        try {
            let res = await fetch(PRIMARY_IOT).catch(() => null);
            if (!res || !res.ok) res = await fetch(FALLBACK_IOT).catch(() => null);
            if (res && res.ok) {
                const data = await res.json();
                setIot(data);
            }
        } catch (e) { console.error('IoT error:', e); }
    };

    const fetchDisease = async () => {
        try {
            let res = await fetch(PRIMARY_DISEASE).catch(() => null);
            if (!res || !res.ok) res = await fetch(FALLBACK_DISEASE).catch(() => null);
            if (res && res.ok) {
                const data = await res.json();
                setDisease(data);
            }
        } catch (e) { console.error('Disease error:', e); }
    };

    const generateReport = async () => {
        setLoadingReport(true);
        setReport(null);

        const prompt = `You are an expert rubber plantation agronomist AI. Analyze the following real-time farm data and generate a comprehensive farm health report.

WEATHER DATA:
- Location: ${weather.location}
- Temperature: ${weather.temp}
- Humidity: ${weather.humidity}
- Sky Condition: ${weather.sky}
- Wind Speed: ${weather.wind}
- Atmospheric Pressure: ${weather.pressure}
- Precipitation: ${weather.precipitation}

IOT SENSOR DATA:
- Soil Moisture: ${iot.soil}%
- Ambient Temperature: ${iot.temperature}°C
- Ambient Humidity: ${iot.humidity}%
- Light Intensity: ${iot.light}
- Last Reading: ${iot.time}

LATEST DISEASE DETECTION:
- Disease Detected: ${disease.disease}
- Confidence: ${disease.confidence}%
- Recommended Treatment: ${disease.treatment}

Based on ALL this data, generate a structured farm health report with these exact sections:

1. OVERALL FARM STATUS (1 line: Healthy / Needs Attention / Critical)
2. WEATHER IMPACT (2-3 lines on how today's weather affects rubber plantation)
3. SOIL & ENVIRONMENT ANALYSIS (2-3 lines analyzing IoT sensor readings)
4. DISEASE RISK ASSESSMENT (2-3 lines based on disease detection + current weather conditions)
5. IMMEDIATE ACTIONS (3-4 specific bullet points the farmer must do today)
6. THIS WEEK'S PLAN (2-3 bullet points for the week ahead)

Keep it practical, farmer-friendly, and specific to rubber plantation in Kerala.`;

        try {
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            });
            setReport(response.choices[0].message.content);
            setReportTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        } catch (e) {
            setReport("⚠️ Unable to generate report. Please check your internet connection and try again.");
        }
        setLoadingReport(false);
    };

    const StatCard = ({ icon, label, value, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <Text style={styles.statVal}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F4D31', '#166534']} style={styles.bg} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadAllData} tintColor="#fff" />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>🌿 Farm Intelligence</Text>
                        <Text style={styles.headerSub}>Live data · AI-powered report</Text>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn} onPress={loadAllData}>
                        <Ionicons name="refresh" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Weather Strip */}
                <View style={styles.weatherStrip}>
                    <View style={styles.weatherMain}>
                        <Text style={{ fontSize: 36 }}>{weather.icon}</Text>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.weatherTemp}>{weather.temp}</Text>
                            <Text style={styles.weatherSky}>{weather.sky}</Text>
                            <Text style={styles.weatherLocation}>📍 {weather.location}</Text>
                        </View>
                    </View>
                    <View style={styles.weatherStats}>
                        <View style={styles.weatherStatItem}>
                            <Text style={styles.weatherStatVal}>{weather.humidity}</Text>
                            <Text style={styles.weatherStatLabel}>Humidity</Text>
                        </View>
                        <View style={styles.weatherDivider} />
                        <View style={styles.weatherStatItem}>
                            <Text style={styles.weatherStatVal}>{weather.wind}</Text>
                            <Text style={styles.weatherStatLabel}>Wind</Text>
                        </View>
                        <View style={styles.weatherDivider} />
                        <View style={styles.weatherStatItem}>
                            <Text style={styles.weatherStatVal}>{weather.precipitation}</Text>
                            <Text style={styles.weatherStatLabel}>Rain</Text>
                        </View>
                    </View>
                </View>

                {/* IoT Sensors */}
                <Text style={styles.sectionTitle}>🔌 IoT Sensors</Text>
                <View style={styles.statsGrid}>
                    <StatCard icon="💧" label="Soil Moisture" value={`${iot.soil}%`} color={COLORS.info} />
                    <StatCard icon="🌡️" label="Temperature" value={`${iot.temperature}°C`} color={COLORS.danger} />
                    <StatCard icon="💨" label="Humidity" value={`${iot.humidity}%`} color={COLORS.primary} />
                    <StatCard icon="☀️" label="Light" value={`${iot.light}`} color={COLORS.accent} />
                </View>

                {/* Disease Detection */}
                <Text style={styles.sectionTitle}>🔬 Latest Disease Detection</Text>
                <View style={styles.diseaseCard}>
                    <View style={styles.diseaseHeader}>
                        <View style={styles.diseaseBadge}>
                            <Text style={styles.diseaseBadgeText}>
                                {disease.confidence !== '--' ? `${disease.confidence}% confidence` : 'No scan yet'}
                            </Text>
                        </View>
                        <Text style={styles.diseaseName}>{disease.disease}</Text>
                    </View>
                    {disease.treatment !== '--' && (
                        <View style={styles.treatmentBox}>
                            <Text style={styles.treatmentLabel}>💊 Treatment:</Text>
                            <Text style={styles.treatmentText}>{disease.treatment}</Text>
                        </View>
                    )}
                </View>

                {/* Generate Report Button */}
                <TouchableOpacity
                    style={[styles.generateBtn, loadingReport && { opacity: 0.7 }]}
                    onPress={generateReport}
                    disabled={loadingReport}
                    activeOpacity={0.85}
                >
                    <LinearGradient colors={['#F57F17', '#F9A825']} style={styles.generateGrad}>
                        {loadingReport ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.generateText}>Analyzing all data with AI...</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="analytics" size={22} color="#fff" />
                                <Text style={styles.generateText}>Generate AI Farm Report</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* AI Report */}
                {report && (
                    <View style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>📋 AI Farm Report</Text>
                            <Text style={styles.reportTime}>Generated at {reportTime}</Text>
                        </View>
                        <View style={styles.reportDivider} />
                        <Text style={styles.reportText}>{report}</Text>
                        <TouchableOpacity style={styles.regenerateBtn} onPress={generateReport}>
                            <Ionicons name="refresh" size={14} color={COLORS.primary} />
                            <Text style={styles.regenerateText}>Regenerate Report</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Pull to refresh hint */}
                {!report && (
                    <Text style={styles.hint}>
                        ↓ Pull down to refresh live data, then tap Generate AI Farm Report
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    bg: { ...StyleSheet.absoluteFillObject },
    scroll: { padding: SPACING.md },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm
    },
    headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.white },
    headerSub: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    refreshBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center'
    },
    weatherStrip: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: RADIUS.lg, padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
    },
    weatherMain: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    weatherTemp: { fontSize: 32, fontWeight: '900', color: COLORS.white },
    weatherSky: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    weatherLocation: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
    weatherStats: { flexDirection: 'row', justifyContent: 'space-around' },
    weatherStatItem: { alignItems: 'center' },
    weatherStatVal: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.white },
    weatherStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
    weatherDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    sectionTitle: {
        fontSize: FONTS.sizes.base, fontWeight: '800',
        color: COLORS.white, marginBottom: SPACING.sm, marginTop: SPACING.sm
    },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: SPACING.sm, marginBottom: SPACING.md
    },
    statCard: {
        width: '47%', backgroundColor: COLORS.white,
        borderRadius: RADIUS.md, padding: SPACING.md,
        alignItems: 'flex-start', ...SHADOW.card
    },
    statVal: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.textDark, marginTop: 6 },
    statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, marginTop: 2 },
    diseaseCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
        padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.card
    },
    diseaseHeader: { marginBottom: SPACING.sm },
    diseaseBadge: {
        backgroundColor: COLORS.accentLight, alignSelf: 'flex-start',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: RADIUS.full, marginBottom: 6
    },
    diseaseBadgeText: { fontSize: 11, color: COLORS.accentDark, fontWeight: '700' },
    diseaseName: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textDark },
    treatmentBox: {
        backgroundColor: COLORS.primaryPale, borderRadius: RADIUS.sm,
        padding: SPACING.sm, marginTop: SPACING.sm
    },
    treatmentLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
    treatmentText: { fontSize: FONTS.sizes.xs, color: COLORS.textDark, lineHeight: 18 },
    generateBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
    generateGrad: {
        padding: SPACING.md + 2, alignItems: 'center',
        justifyContent: 'center', flexDirection: 'row'
    },
    generateText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '800' },
    reportCard: {
        backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
        padding: SPACING.md, ...SHADOW.heavy
    },
    reportHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: SPACING.sm
    },
    reportTitle: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.textDark },
    reportTime: { fontSize: 10, color: COLORS.textHint },
    reportDivider: { height: 1, backgroundColor: COLORS.borderLight, marginBottom: SPACING.md },
    reportText: {
        fontSize: FONTS.sizes.sm, color: COLORS.textDark,
        lineHeight: 22, letterSpacing: 0.2
    },
    regenerateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: SPACING.md, alignSelf: 'flex-end'
    },
    regenerateText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },
    hint: {
        textAlign: 'center', color: 'rgba(255,255,255,0.5)',
        fontSize: FONTS.sizes.xs, marginTop: SPACING.md, fontStyle: 'italic'
    }
});