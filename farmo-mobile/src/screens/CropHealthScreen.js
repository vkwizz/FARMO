import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Alert, Platform, TextInput,
    Modal, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge, SectionHeader, Button } from '../components/UI';
import { useTranslation } from '../contexts/LanguageContext';
import advisoryData from '../advisory.json';

export default function CropHealthScreen() {
    const insets = useSafeAreaInsets();
    const { t, setLang, languages } = useTranslation();
    
    const [image, setImage] = useState(null);
    const [symptoms, setSymptoms] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [langModalVisible, setLangModalVisible] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Allow gallery access to scan leaves.'); return; }
        const res = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            quality: 0.5,
            base64: true 
        });
        if (!res.canceled) { analyzeLeaf(res.assets[0]); }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Allow camera access to scan leaves.'); return; }
        const res = await ImagePicker.launchCameraAsync({ 
            quality: 0.5,
            base64: true 
        });
        if (!res.canceled) { analyzeLeaf(res.assets[0]); }
    };

    const analyzeLeaf = async (asset) => {
        setImage(asset.uri);
        setResult(null);
        setAnalyzing(true);

        try {
            const PRIMARY_URL = 'https://rubber-chatbot-api.onrender.com/predict';
            const FALLBACK_URL = 'http://10.124.244.29:10000/predict';

            const payload = {
                image_b64: asset.base64,
                symptoms: symptoms
            };

            const fetchPrediction = async (url) => {
                console.log(`🤖 Attempting AI prediction at: ${url}`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const contentType = response.headers.get("content-type");
                if (response.ok && contentType && contentType.includes("application/json")) {
                    return await response.json();
                } else {
                    const text = await response.text();
                    console.warn(`⚠️ API at ${url} returned non-JSON: ${text.substring(0, 100)}`);
                    return null;
                }
            };

            let data = await fetchPrediction(PRIMARY_URL).catch(() => null);
            
            if (!data) {
                console.warn("Retrying with Local Fallback AI...");
                data = await fetchPrediction(FALLBACK_URL).catch((err) => {
                    console.error("Local AI also failed:", err);
                    return null;
                });
            }

            if (data) {
                setResult(data);
            } else {
                throw new Error("All AI prediction endpoints failed.");
            }
        } catch (err) {
            console.error("ANALYSIS_CRASH:", err);
            Alert.alert("Analysis Error", "Failed to connect to AI Predictor. Please check your network or try again later.");
        } finally {
            setAnalyzing(false);
        }
    };

    const activeRegistry = [
        { name: 'Powdery Mildew', pathogen: 'Oidium heveae', severity: 'High', trees: 23, confidence: 94.2, type: 'danger' },
        { name: 'Birds-eye Spot', pathogen: 'Helminthosporium', severity: 'Medium', trees: 12, confidence: 88.7, type: 'warning' },
        { name: 'Pink Disease', pathogen: 'Erythricium', severity: 'Low', trees: 4, confidence: 91.5, type: 'success' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F7F6' }}>
            <ScrollView style={styles.container} contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                {/* Header Banner */}
                <LinearGradient colors={['#0F4D31', '#166534']} style={[styles.banner, { paddingTop: insets.top + 20 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 }}>
                        <Text style={styles.bannerIcon}>🔬</Text>
                        <View>
                            <Text style={styles.bannerTitle}>Crop Health Agent</Text>
                            <Text style={styles.bannerSub}>Multimodal AI Inference</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.langBtn} activeOpacity={0.7} onPress={() => setLangModalVisible(true)}>
                        <Text style={{ fontSize: 20 }}>🌐</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* KPIs */}
                <View style={styles.kpiRow}>
                    {[
                        { icon: '🌳', label: 'Trees', value: '1,240', color: COLORS.primary },
                        { icon: '⚠️', label: 'Diseased', value: '46', color: COLORS.danger },
                        { icon: '✅', label: 'Treated', value: '31', color: COLORS.success },
                        { icon: '🎯', label: 'Accuracy', value: '96.8%', color: COLORS.info },
                    ].map((k) => (
                        <View key={k.label} style={[styles.miniKpi, { borderTopColor: k.color, borderTopWidth: 3 }]}>
                            <Text style={{ fontSize: 18 }}>{k.icon}</Text>
                            <Text style={[styles.miniVal, { color: k.color }]}>{k.value}</Text>
                            <Text style={styles.miniLabel}>{k.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Leaf Scanner */}
                <SectionHeader title={`📷 ${t('scannow')}`} sub="Upload leaf photo & describe symptoms" />
                <Card>
                    <TouchableOpacity style={styles.dropZone} onPress={pickImage} activeOpacity={0.85}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.leafImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.dropPlaceholder}>
                                <Text style={{ fontSize: 44, marginBottom: 8 }}>🍃</Text>
                                <Text style={styles.dropText}>{t('scannow')}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Multimodal Input */}
                    <View style={styles.inputStack}>
                        <Text style={styles.inputLabel}>{t('symptoms')} (Optional):</Text>
                        <TextInput 
                            placeholder="e.g. Yellow spots on edges..."
                            placeholderTextColor={COLORS.textHint}
                            style={styles.textInput}
                            value={symptoms}
                            onChangeText={setSymptoms}
                            multiline
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
                        <Button label={t('analyzeText')} onPress={takePhoto} variant="primary" style={{ flex: 1 }} />
                        <Button label="🖼 Gallery" onPress={pickImage} variant="outline" style={{ flex: 1 }} />
                    </View>

                    {analyzing && (
                        <View style={styles.analyzing}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.analyzingText}>AI Analysis...</Text>
                        </View>
                    )}

                    {result && !analyzing && (
                        <View style={styles.resultBox}>
                            <View style={styles.resultHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultDisease}>🦠 {result.disease}</Text>
                                    <Text style={styles.resultPathogen}>{result.pathogen}</Text>
                                </View>
                                <Badge label={`${result.confidence}% Match`} type={result.confidence > 90 ? "success" : "warning"} />
                            </View>
                            
                            <Text style={styles.resultLabel}>🌿 {t('treatmentLabel')}:</Text>
                            <Text style={styles.resultTreatment}>{result.treatment}</Text>

                            {result.solutions_detail?.prevention?.length > 0 && (
                                <>
                                    <Text style={styles.resultLabel}>🛡️ Prevention:</Text>
                                    {result.solutions_detail.prevention.map((p, idx) => (
                                        <Text key={idx} style={styles.bulletItem}>• {p}</Text>
                                    ))}
                                </>
                            )}

                            <View style={styles.mlBox}>
                                <Text style={styles.mlText}>📍 {result.malayalam}</Text>
                            </View>

                            {result.assistant && (
                                <Text style={styles.assistantTag}>Analyzed by: {result.assistant}</Text>
                            )}
                        </View>
                    )}
                </Card>

                <SectionHeader title="🗒 Recent Detections" />
                {activeRegistry.map((d, i) => (
                    <Card key={i} style={{ marginBottom: SPACING.sm }}>
                        <View style={styles.diseaseRow}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: d.type === 'danger' ? COLORS.danger : d.type === 'warning' ? COLORS.warning : COLORS.success }} />
                                    <Text style={styles.diseaseName}>{d.name}</Text>
                                </View>
                                <Text style={styles.diseasePathogen}>{d.pathogen}</Text>
                            </View>
                            <Badge label={d.severity} type={d.type} />
                        </View>
                    </Card>
                ))}
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
    container: { flex: 1 },
    scroll: { paddingHorizontal: 20 },
    banner: { marginHorizontal: -20, paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginBottom: 20 },
    bannerIcon: { fontSize: 36 },
    bannerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
    bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    langBtn: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    kpiRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
    miniKpi: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 10, alignItems: 'center', ...SHADOW.card },
    miniVal: { fontSize: FONTS.sizes.md, fontWeight: '800', marginTop: 4 },
    miniLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
    dropZone: { borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: RADIUS.md, overflow: 'hidden', minHeight: 140 },
    leafImage: { width: '100%', height: 200 },
    dropPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    dropText: { fontSize: FONTS.sizes.base, color: COLORS.textGray, fontWeight: '600' },
    inputStack: { marginTop: SPACING.md },
    inputLabel: { fontSize: 12, color: COLORS.textGray, fontWeight: '700', marginBottom: 6 },
    textInput: { backgroundColor: '#F0F3F2', borderRadius: RADIUS.sm, padding: 12, fontSize: 14, color: COLORS.textDark, textAlignVertical: 'top', minHeight: 60 },
    analyzing: { alignItems: 'center', paddingVertical: SPACING.lg },
    analyzingText: { fontSize: FONTS.sizes.sm, color: COLORS.textGray, fontWeight: '600' },
    resultBox: { marginTop: SPACING.md, padding: SPACING.md, backgroundColor: '#FFF3E0', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.accentMid },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    resultDisease: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textDark },
    resultPathogen: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, fontStyle: 'italic' },
    resultLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
    resultTreatment: { fontSize: FONTS.sizes.sm, color: COLORS.textDark, lineHeight: 20, marginBottom: SPACING.sm },
    mlBox: { backgroundColor: COLORS.primaryPale, padding: SPACING.sm, borderRadius: RADIUS.sm },
    mlText: { fontSize: FONTS.sizes.sm, color: COLORS.textMid, lineHeight: 22 },
    diseaseRow: { flexDirection: 'row', alignItems: 'center' },
    diseaseName: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.textDark },
    diseasePathogen: { fontSize: FONTS.sizes.xs, color: COLORS.textGray, fontStyle: 'italic' },
    bulletItem: { fontSize: 13, color: COLORS.textDark, marginLeft: 12, marginBottom: 4, lineHeight: 18 },
    assistantTag: { fontSize: 10, color: COLORS.textLight, marginTop: 12, fontStyle: 'italic', textAlign: 'right' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 24, ...SHADOW.card },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
    langItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    langLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
});
