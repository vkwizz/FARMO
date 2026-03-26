import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, TextInput, Image, Dimensions,
    ActivityIndicator, Modal, FlatList,
    StatusBar
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionHeader, Card } from '../components/UI';
import { useTranslation } from '../contexts/LanguageContext';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

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

        const performFetch = async (url) => {
            const response = await fetch(url).catch(() => null);
            if (!response || !response.ok) return null;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                try {
                    return await response.json();
                } catch (e) {
                    console.warn(`JSON parse error on ${url}`);
                    return null;
                }
            }
            return null;
        };

        try {
            let data = await performFetch(PRIMARY_URL);
            if (!data) {
                data = await performFetch(FALLBACK_URL);
            }

            if (data) {
                setIotData(data);
                setIotError(false);
            } else {
                setIotError(true);
            }
        } catch (e) {
            console.error("IoT fetch crash:", e);
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
            <StatusBar barStyle="light-content" />
            <LinearGradient 
                colors={['#064E3B', '#065F46', '#059669']} 
                style={[styles.headerGradient, { height: width * 0.95 }]} 
            />

            <ScrollView 
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 10 }]} 
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting Header */}
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.helloText}>Hello,</Text>
                        <Text style={styles.greetText}>Good Morning</Text>
                        <Text style={styles.dateHeaderText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity 
                            style={styles.iconCircle} 
                            onPress={() => setLangModalVisible(true)}
                        >
                            <Ionicons name="globe-outline" size={20} color="#E0F2FE" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconCircle}>
                            <Ionicons name="notifications-outline" size={20} color="#FDE68A" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput 
                        placeholder="Search here..." 
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={styles.searchInput}
                    />
                    <TouchableOpacity>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>

                {/* Weather Card */}
                <Card style={styles.weatherCard}>
                    {loading ? (
                        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    ) : (
                        <View>
                            <View style={styles.weatherHeader}>
                                <View>
                                    <Text style={styles.cityName}>{weather.city}</Text>
                                    <Text style={styles.mainTemp}>{weather.temp}<Text style={{ fontSize: 28 }}>°</Text></Text>
                                    <View style={styles.weatherStatusBox}>
                                        <Text style={styles.skyText}>{weather.desc}</Text>
                                    </View>
                                </View>
                                <View style={styles.weatherIconLarge}>
                                    <MaterialCommunityIcons name="cloud" size={54} color="#E0F2FE" />
                                </View>
                            </View>

                            <View style={styles.weatherStatsGrid}>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>HUMIDITY</Text>
                                    <Text style={styles.wsVal}>{weather.humidity}</Text>
                                </View>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>PRECIPITATION</Text>
                                    <Text style={styles.wsVal}>{weather.preci}</Text>
                                </View>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>PRESSURE</Text>
                                    <Text style={styles.wsVal}>{weather.pressure}</Text>
                                </View>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>WIND</Text>
                                    <Text style={styles.wsVal}>{weather.wind}</Text>
                                </View>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>SUNRISE</Text>
                                    <Text style={styles.wsVal}>{weather.sunrise}</Text>
                                </View>
                                <View style={styles.weatherStatItem}>
                                    <Text style={styles.wsLabel}>SUNSET</Text>
                                    <Text style={styles.wsVal}>{weather.sunset}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </Card>

                {/* IoT Sensors Section */}
                <View style={styles.sectionHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                         <MaterialCommunityIcons name="satellite-variant" size={22} color="white" />
                         <Text style={styles.sectionTitleWhite}>Field Sensors</Text>
                         <View style={styles.liveDot} />
                    </View>
                    <Text style={styles.timeTextWhite}>{iotData.time}</Text>
                </View>

                <View style={styles.iotGrid}>
                    {/* Soil Moisture */}
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#E0F2FE' }]}>
                             <Ionicons name="water" size={24} color="#0EA5E9" />
                        </View>
                        <Text style={styles.iotLabel}>Soil Moisture</Text>
                        <Text style={styles.iotVal}>{iotData.soil}%</Text>
                        <Text style={styles.iotSub}>Optimal: 40-60%</Text>
                    </Card>

                    {/* Illumination */}
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#FEF3C7' }]}>
                             <Ionicons name="sunny" size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.iotLabel}>Illumination</Text>
                        <Text style={styles.iotVal}>{iotData.light}%</Text>
                        <Text style={styles.iotSub}>Live Exposure</Text>
                    </Card>

                    {/* Air Humidity */}
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#DCFCE7' }]}>
                             <MaterialCommunityIcons name="thermometer" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.iotLabel}>Air Humidity</Text>
                        <Text style={styles.iotVal}>{iotData.humidity}%</Text>
                        <Text style={styles.iotSub}>Ambient</Text>
                    </Card>

                    {/* Temperature */}
                    <Card style={styles.iotCard}>
                        <View style={[styles.iotIconBox, { backgroundColor: '#FEE2E2' }]}>
                             <MaterialCommunityIcons name="thermometer-lines" size={24} color="#EF4444" />
                        </View>
                        <Text style={styles.iotLabel}>Temperature</Text>
                        <Text style={styles.iotVal}>{iotData.temperature}°C</Text>
                        <Text style={styles.iotSub}>System Core</Text>
                    </Card>
                </View>

                {/* Market Section */}
                <SectionHeader title={t('market')} />
                <View style={styles.iotGrid}>
                    {rubberStocks.map(item => (
                        <Card key={item.grade} style={styles.iotCard}>
                            <View style={styles.marketIconBox}>
                                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                            </View>
                            <Text style={styles.iotLabel}>{item.grade}</Text>
                            <Text style={styles.iotVal}>{item.price}</Text>
                        </Card>
                    ))}
                </View>

                <View style={{ height: 100 }} />
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
    screen: { flex: 1, backgroundColor: '#064E3B' },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    scroll: { paddingHorizontal: 20 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    helloText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
    greetText: { color: 'white', fontSize: 32, fontWeight: '800' },
    dateHeaderText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },
    headerIcons: { flexDirection: 'row', gap: 12 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 40, paddingHorizontal: 20, paddingVertical: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    searchInput: { flex: 1, color: 'white', fontSize: 16, fontWeight: '600' },
    weatherCard: { padding: 24, borderRadius: 48, backgroundColor: 'white', marginBottom: 24, ...SHADOW.card },
    weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cityName: { fontSize: 18, color: '#333', fontWeight: '800' },
    mainTemp: { fontSize: 44, fontWeight: '900', color: '#1a1a1a', marginTop: 8 },
    weatherStatusBox: { marginTop: 16 },
    skyText: { fontSize: 16, color: '#666', fontWeight: '700' },
    weatherIconLarge: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
    weatherStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20 },
    weatherStatItem: { width: (width - 100) / 3, marginBottom: 16 },
    wsLabel: { fontSize: 10, color: '#999', fontWeight: '800', marginBottom: 4 },
    wsVal: { fontSize: 14, color: '#1a1a1a', fontWeight: '800' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitleWhite: { fontSize: 20, fontWeight: '800', color: 'white' },
    timeTextWhite: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginLeft: 4 },
    iotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    iotCard: { width: (width - 52) / 2, padding: 18, borderRadius: 24, alignItems: 'center', backgroundColor: 'white' },
    iotIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    iotLabel: { fontSize: 13, color: '#666', fontWeight: '700' },
    iotVal: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginTop: 4 },
    iotSub: { fontSize: 11, color: '#999', marginTop: 4, fontWeight: '600' },
    marketIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 24, ...SHADOW.card },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
    langItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    langLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
});
