import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionHeader, Card } from '../components/UI';

const WEATHER_MAPPING = {
    0: { label: 'Clear Sky', icon: '☀️' },
    1: { label: 'Mainly Clear', icon: '🌤️' },
    2: { label: 'Partly Cloudy', icon: '⛅' },
    3: { label: 'Overcast', icon: '☁️' },
    61: { label: 'Slight Rain', icon: '🌦️' },
    63: { label: 'Moderate Rain', icon: '🌧️' },
    80: { label: 'Rain Showers', icon: '🌧️' },
    default: { label: 'Cloudy', icon: '☁️' }
};

export default function DashboardScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = React.useState(true);
    const [location, setLocation] = React.useState(null);
    const [weather, setWeather] = React.useState({
        temp: '--',
        city: 'Fetching Location...',
        humidity: '--%',
        preci: '-- ml',
        wind: '-- m/s',
        pressure: '-- hpa',
        icon: '☁️',
        desc: 'Checking sky...'
    });

    const [iotData, setIotData] = React.useState({
        soil: 0,
        light: 0,
        humidity: 0,
        temperature: 0,
        time: '...'
    });

    const [rubberStocks, setRubberStocks] = React.useState([
        { grade: 'RSS 4', price: '₹182.00', change: '+₹1.50', trend: 'up', icon: '📜' },
        { grade: 'RSS 5', price: '₹178.50', change: '-₹0.20', trend: 'down', icon: '📄' },
        { grade: 'ISNR 20', price: '₹164.00', change: '+₹0.80', trend: 'up', icon: '📦' },
        { grade: 'Latex', price: '₹125.40', change: '+₹2.10', trend: 'up', icon: '🧪' },
    ]);

    React.useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error("Permission refused");
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            fetchWeather(loc.coords.latitude, loc.coords.longitude);
            fetchRubberPrices();
            fetchIoTData();
        })();

        const interval = setInterval(fetchIoTData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchIoTData = async () => {
        try {
            const res = await fetch('http://localhost:10000/data');
            const data = await res.json();
            setIotData(data);
        } catch (e) {
            console.error("IoT Sync Error:", e);
        }
    };

    const fetchRubberPrices = async () => {
        try {
            // Simulated live rubber market fetch (could be Rubber Board SCRAP Endpoint)
            const prices = [
                { grade: 'RSS 4', price: '₹184.50', change: '+₹1.20', trend: 'up', icon: '📜' },
                { grade: 'RSS 5', price: '₹180.20', change: '+₹0.70', trend: 'up', icon: '📄' },
                { grade: 'ISNR 20', price: '₹166.40', change: '-₹0.30', trend: 'down', icon: '📦' },
                { grade: 'Latex', price: '₹127.10', change: '+₹1.50', trend: 'up', icon: '🧪' },
            ];
            setRubberStocks(prices);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchWeather = async (lat, lon) => {
        try {
            // Weather
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,precipitation&timezone=auto`);
            const weatherData = await weatherRes.json();

            // City
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const geoData = await geoRes.json();
            const cityName = geoData.address.city || geoData.address.town || geoData.address.village || 'Kerala, IN';

            const current = weatherData.current;
            const sky = WEATHER_MAPPING[current.weather_code] || WEATHER_MAPPING.default;

            setWeather({
                temp: `${Math.round(current.temperature_2m)}°C`,
                city: cityName,
                humidity: `${current.relative_humidity_2m}%`,
                preci: `${current.precipitation} ml`,
                wind: `${current.wind_speed_10m} m/s`,
                pressure: `${current.surface_pressure} hpa`,
                icon: sky.icon,
                desc: sky.label,
                sunrise: '5:45 AM',
                sunset: '6:32 PM'
            });
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const weatherStatsItems = [
        { label: 'Humidity', value: weather.humidity },
        { label: 'Precipitation', value: weather.preci },
        { label: 'Pressure', value: weather.pressure },
        { label: 'Wind', value: weather.wind },
        { label: 'Sunrise', value: weather.sunrise },
        { label: 'Sunset', value: weather.sunset },
    ];
    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0D4D31', '#0F6A3F']}
                style={styles.gradientBg}
            />

            <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                {/* Greeting + Search */}
                <View style={styles.headerCard}>
                    <View>
                        <Text style={styles.greetLabel}>Hello,</Text>
                        <Text style={styles.greetName}>Good Morning</Text>
                        <Text style={styles.greetDate}>Sunday, 01 Dec 2024</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.langBtn} activeOpacity={0.7}>
                            <Text style={{ fontSize: 20 }}>🌐</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.notifBtn}>
                            <Text style={{ color: COLORS.white, fontSize: 16 }}>🔔</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchWrap}>
                    <TextInput
                        placeholder="Search here..."
                        placeholderTextColor="#9BB5A4"
                        style={styles.search}
                    />
                    <Text style={styles.searchIcon}>🔍</Text>
                </View>

                {/* Weather */}
                <View style={styles.weatherCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={styles.city}>{weather.city}</Text>
                            <Text style={styles.tempMain}>{weather.temp}</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={styles.tempSmall}>{weather.desc}</Text>
                            </View>
                        </View>
                        <View style={styles.weatherIconBubble}>
                            <Text style={{ fontSize: 28 }}>{weather.icon}</Text>
                        </View>
                    </View>
                    <View style={styles.weatherStats}>
                        {weatherStatsItems.map((item) => (
                            <View key={item.label} style={styles.statPill}>
                                <Text style={styles.statLabel}>{item.label}</Text>
                                <Text style={styles.statValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Field Sensors - Real-time IoT Data */}
                <View style={[styles.sectionRow, { marginTop: SPACING.md }]}>
                    <Text style={styles.sectionTitle}>📡 Field Sensors (Live)</Text>
                    <Text style={[styles.viewAll, { color: '#34d399' }]}>{iotData.time}</Text>
                </View>
                <View style={[styles.catGrid, { marginBottom: SPACING.sm }]}>
                    <Card style={styles.catCard}>
                        <View style={[styles.stockIconWrap, { backgroundColor: '#E0F2FE' }]}>
                            <Text style={styles.catIcon}>💧</Text>
                        </View>
                        <Text style={styles.gradeTitle}>Soil</Text>
                        <Text style={styles.priceVal}>{iotData.soil}%</Text>
                    </Card>
                    <Card style={styles.catCard}>
                        <View style={[styles.stockIconWrap, { backgroundColor: '#FEF3C7' }]}>
                            <Text style={styles.catIcon}>☀️</Text>
                        </View>
                        <Text style={styles.gradeTitle}>Light</Text>
                        <Text style={styles.priceVal}>{iotData.light}%</Text>
                    </Card>
                    <Card style={styles.catCard}>
                        <View style={[styles.stockIconWrap, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={styles.catIcon}>🌡️</Text>
                        </View>
                        <Text style={styles.gradeTitle}>Humidity</Text>
                        <Text style={styles.priceVal}>{iotData.humidity}%</Text>
                    </Card>
                    <Card style={styles.catCard}>
                        <View style={[styles.stockIconWrap, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={styles.catIcon}>🌡️</Text>
                        </View>
                        <Text style={styles.gradeTitle}>Temp</Text>
                        <Text style={styles.priceVal}>{iotData.temperature}°C</Text>
                    </Card>
                </View>

                {/* Alerts & Notifications */}
                <SectionHeader title="🔔 Alerts & Notifications" />
                <Card style={{ marginBottom: SPACING.md }}>
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Text style={{ fontSize: 20 }}>⚠️</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: COLORS.textDark }}>Disease outbreak detected nearby</Text>
                                <Text style={{ fontSize: 12, color: COLORS.textGray }}>3 reports of Powdery Mildew in Kottayam sector.</Text>
                            </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: COLORS.borderLight }} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Text style={{ fontSize: 20 }}>⛈️</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: COLORS.textDark }}>Heavy rain incoming</Text>
                                <Text style={{ fontSize: 12, color: COLORS.textGray }}>Expect 15mm/h precipitation across your area.</Text>
                            </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: COLORS.borderLight }} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Text style={{ fontSize: 20 }}>📉</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: '700', color: COLORS.textDark }}>Market price drop alert</Text>
                                <Text style={{ fontSize: 12, color: COLORS.textGray }}>RSS 4 grade down by ₹2.50 in evening sessions.</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Rubber Stocks */}
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>📈 Rubber Market Rates</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>Live Updates</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.catGrid}>
                    {rubberStocks.map((item) => (
                        <Card key={item.grade} style={styles.catCard}>
                            <View style={styles.stockIconWrap}>
                                <Text style={styles.catIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.gradeTitle}>{item.grade}</Text>
                            <Text style={styles.priceVal}>{item.price}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[styles.trendText, { color: item.trend === 'up' ? COLORS.success : COLORS.danger }]}>
                                    {item.trend === 'up' ? '▲' : '▼'} {item.change}
                                </Text>
                            </View>
                        </Card>
                    ))}
                </View>

                {/* Quick launch */}
                <View style={styles.quickRow}>
                    <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#0F6A3F' }]} onPress={() => navigation.navigate('Weather')}>
                        <Text style={styles.quickEmoji}>⛅</Text>
                        <Text style={[styles.quickText, { color: COLORS.white }]}>Weather</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CropHealth')}>
                        <Text style={styles.quickEmoji}>🧬</Text>
                        <Text style={styles.quickText}>Crop</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: SPACING.lg }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0C4A31' },
    gradientBg: { ...StyleSheet.absoluteFillObject },
    scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: SPACING.sm,
    },
    greetLabel: { color: '#B9D6C4', fontSize: FONTS.sizes.sm, letterSpacing: 0.3 },
    greetName: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '800', marginVertical: 2 },
    greetDate: { color: '#C9E0D1', fontSize: FONTS.sizes.xs },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    langBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    },
    notifBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    },
    searchWrap: {
        marginVertical: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
    },
    search: { flex: 1, height: 44, color: COLORS.white, fontSize: FONTS.sizes.base },
    searchIcon: { fontSize: 18, color: '#C9E0D1' },
    weatherCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOW.card,
        marginBottom: SPACING.md,
    },
    city: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, fontWeight: '700', marginBottom: 2 },
    tempMain: { fontSize: 44, fontWeight: '900', color: COLORS.textDark },
    tempSmall: { fontSize: FONTS.sizes.xs, color: COLORS.textGray },
    weatherIconBubble: {
        width: 70, height: 70, borderRadius: 24,
        backgroundColor: COLORS.primaryPale,
        alignItems: 'center', justifyContent: 'center',
    },
    weatherStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    statPill: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.offWhite,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        minWidth: '30%',
    },
    statLabel: { fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
    statValue: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    catCard: {
        width: '48.5%',
        padding: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stockIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: COLORS.offWhite,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
    },
    gradeTitle: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, fontWeight: '700' },
    priceVal: { fontSize: FONTS.sizes.base, fontWeight: '800', color: COLORS.textDark, marginVertical: 2 },
    trendText: { fontSize: 10, fontWeight: '700' },
    catIcon: { fontSize: 22 },
    catTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textDark },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    sectionTitle: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
    viewAll: { color: '#C9E0D1', fontSize: FONTS.sizes.xs },
    quickRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
    quickBtn: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        ...SHADOW.card,
    },
    quickEmoji: { fontSize: 22, marginBottom: 4 },
    quickText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textDark },
});
