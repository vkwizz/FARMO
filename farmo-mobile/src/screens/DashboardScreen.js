import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Image, Dimensions,
    ActivityIndicator, Modal, FlatList
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionHeader, Card } from '../components/UI';
import { useTranslation } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

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
    const { t, setLang, languages } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [langModalVisible, setLangModalVisible] = useState(false);
    
    const [weather, setWeather] = useState({
        temp: '--',
        city: 'Fetching...',
        humidity: '--%',
        preci: '-- ml',
        wind: '-- m/s',
        pressure: '-- hpa',
        icon: '☁️',
        desc: 'Checking sky...',
        sunrise: '5:25 am',
        sunset: '8:04 pm'
    });

    const [iotData, setIotData] = useState({
        soil: 0,
        light: 0,
        humidity: 0,
        temperature: 0,
        time: '...'
    });

    const [rubberStocks] = useState([
        { grade: 'RSS 4', price: '₹182.50', change: '+₹1.50', trend: 'up', icon: '📜' },
        { grade: 'RSS 5', price: '₹178.20', change: '-₹0.20', trend: 'down', icon: '📄' },
        { grade: 'ISNR 20', price: '₹165.00', change: '+₹0.80', trend: 'up', icon: '📦' },
        { grade: 'Latex', price: '₹126.40', change: '+₹2.10', trend: 'up', icon: '🧪' },
    ]);

    const [iotError, setIotError] = useState(false);

    useEffect(() => {
        handleRefreshLocation();
        fetchIoTData();
        const interval = setInterval(fetchIoTData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefreshLocation = async () => {
        try {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocation(loc);
            await fetchWeather(loc.coords.latitude, loc.coords.longitude);
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    const fetchIoTData = async () => {
        const PRIMARY_URL = 'https://rubber-chatbot-api.onrender.com/data';
        const FALLBACK_URL = 'http://10.124.244.29:10000/data';
        try {
            let res = await fetch(PRIMARY_URL).catch(() => null);
            if (!res || !res.ok) {
                res = await fetch(FALLBACK_URL).catch(() => null);
            }
            if (res && res.ok) {
                const data = await res.json();
                setIotData(data);
                setIotError(false);
            }
        } catch (e) {
            setIotError(true);
        }
    };

    const fetchWeather = async (lat, lon) => {
        try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,precipitation&timezone=auto`);
            if (!weatherRes.ok) return;
            const weatherData = await weatherRes.json();
            
            let cityName = 'Kerala, IN';
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                    headers: { 'User-Agent': 'FARMO-App-User' }
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    cityName = geoData.address.suburb || geoData.address.city || geoData.address.town || 'Kerala, IN';
                }
            } catch (err) {}

            const current = weatherData.current;
            const sky = WEATHER_MAPPING[current.weather_code] || WEATHER_MAPPING.default;

            setWeather(prev => ({
                ...prev,
                temp: `${Math.round(current.temperature_2m)}°`,
                city: cityName,
                humidity: `${current.relative_humidity_2m}%`,
                preci: `${current.precipitation} ml`,
                wind: `${current.wind_speed_10m} m/s`,
                pressure: `${current.surface_pressure} hpa`,
                icon: sky.icon,
                desc: sky.label,
            }));
        } catch (e) {}
    };

    const formattedDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <View style={styles.screen}>
            <LinearGradient colors={['#0F4D31', '#166534']} style={[styles.headerGradient, { height: width * 0.72 }]} />

            <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10 }]} showsVerticalScrollIndicator={false}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.greetText}>{t('hello')}, VK</Text>
                        <TouchableOpacity style={styles.dateSelector}>
                            <Text style={styles.dateText}>{formattedDate} ⌵</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                         <TouchableOpacity style={styles.langBtnSmall} onPress={() => setLangModalVisible(true)}>
                            <Text style={{ fontSize: 18 }}>🌐</Text>
                        </TouchableOpacity>
                        <Image source={require('../../assets/vk.png')} style={styles.avatar} />
                    </View>
                </View>

                {/* Weather Card */}
                <Card style={styles.weatherCard}>
                    {loading ? (
                        <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.locationRow} onPress={handleRefreshLocation}>
                                <Text style={{ fontSize: 18 }}>📍</Text>
                                <Text style={styles.cityName}>{weather.city}</Text>
                            </TouchableOpacity>

                            <View style={styles.weatherMain}>
                                <View>
                                    <Text style={styles.mainTemp}>{weather.temp}C</Text>
                                    <Text style={styles.skyText}>{weather.desc}</Text>
                                </View>
                                <Text style={{ fontSize: 52 }}>{weather.icon}</Text>
                            </View>
                        </>
                    )}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}><Text style={styles.statLabel}>{t('humidity')}</Text><Text style={styles.statVal}>{weather.humidity}</Text></View>
                        <View style={styles.statItem}><Text style={styles.statLabel}>Wind</Text><Text style={styles.statVal}>{weather.wind}</Text></View>
                    </View>
                </Card>

                {/* IoT Sensors */}
                <SectionHeader title={t('scannow')} sub={iotData.time} />
                <View style={styles.iotGrid}>
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#E0F2FE' }]}><Text style={{ fontSize: 24 }}>💧</Text></View>
                        <Text style={styles.iotLabel}>{t('soil')}</Text>
                        <Text style={styles.iotVal}>{iotData.soil}%</Text>
                    </Card>
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#FEF2F2' }]}><Text style={{ fontSize: 24 }}>🌡️</Text></View>
                        <Text style={styles.iotLabel}>{t('temp')}</Text>
                        <Text style={styles.iotVal}>{iotData.temperature}°C</Text>
                    </Card>
                </View>

                {/* Rubber Market */}
                <SectionHeader title={t('market')} />
                <View style={styles.iotGrid}>
                    {rubberStocks.map(item => (
                        <Card key={item.grade} style={styles.iotCard}>
                            <Text style={styles.iotLabel}>{item.grade}</Text>
                            <Text style={styles.iotVal}>{item.price}</Text>
                        </Card>
                    ))}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Language Modal */}
            <Modal visible={langModalVisible} transparent animationType="fade" onRequestClose={() => setLangModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Language</Text>
                        <FlatList 
                            data={languages}
                            keyExtractor={item => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.langItem}
                                    onPress={() => { setLang(item.code); setLangModalVisible(false); }}
                                >
                                    <Text style={{ fontSize: 24 }}>{item.flag}</Text>
                                    <Text style={styles.langLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F7F6' },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
    scroll: { paddingHorizontal: 20 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    greetText: { color: 'white', fontSize: 20, fontWeight: '700' },
    dateSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'white' },
    langBtnSmall: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    weatherCard: { marginTop: 10, padding: 20, borderRadius: 24, backgroundColor: 'white', ...SHADOW.card },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    cityName: { fontSize: 16, color: '#1a1a1a', fontWeight: '800' },
    weatherMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainTemp: { fontSize: 44, fontWeight: '900', color: '#1a1a1a' },
    skyText: { fontSize: 14, color: '#666', fontWeight: '700' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    statItem: { flex: 1 },
    statLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
    statVal: { fontSize: 14, color: '#1a1a1a', fontWeight: '800' },
    iotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    iotCard: { width: (width - 52) / 2, padding: 16, borderRadius: 20, alignItems: 'center' },
    iotIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    iotLabel: { fontSize: 12, color: '#666', fontWeight: '700' },
    iotVal: { fontSize: 18, fontWeight: '900', color: '#1a1a1a', marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 24, ...SHADOW.card },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
    langItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    langLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
});
