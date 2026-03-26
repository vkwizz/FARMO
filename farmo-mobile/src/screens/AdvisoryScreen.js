import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TextInput, TouchableOpacity, KeyboardAvoidingView,
    Platform, FlatList, ActivityIndicator, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Card, Badge, Button } from '../components/UI';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../contexts/LanguageContext';

const QUICK_QUESTIONS = [
    'Best time to tap rubber?',
    'ഇലപ്പൊഴിയൽ എങ്ങനെ നിയന്ത്രിക്കാം?',
    'How much for tapping?',
    'Powdery mildew treatment?',
    'ഗവൺമെന്റ് ഇൻഷുറൻസ് പദ്ധതി?',
];

const RAG_DOCS = [
    'Kerala Rubber Board Guidelines 2024',
    'Rubber Disease Management Manual',
    'RRII High-Yield Clones Bulletin',
    'IPM for Rubber – Kerala',
    'Tapping Yield Optimization',
];

const MOCK_RESPONSES = {
    default: {
        text: 'Based on the Kerala Rubber Board Guidelines:\n\n🕐 Best tapping window: 5:30–7:30 AM when temperatures are cool (22–26°C) and humidity is high.\n\n• Use ½S/2 cut (half spiral, alternate day)\n• Apply Ethephon 2.5% for Panel B stimulation\n• Avoid tapping 48h after heavy rain\n• Sanitise knife weekly with bleach\n\n📄 Source: RRII Bulletin Vol.3, Rubber Board SOP 2024',
        sources: ['Kerala Rubber Board Guidelines 2024', 'RRII High-Yield Clones Bulletin'],
    },
    disease: {
        text: 'ഇലപ്പൊഴിയൽ (Leaf Fall Disease) നിയന്ത്രണം:\n\n1️⃣ Bordeaux Mixture 1% – ഒക്ടോബർ-നവംബർ: 3 തവണ spray\n2️⃣ Metalaxyl 25% WP – 2 g/L വെള്ളത്തിൽ\n3️⃣ Drainage ഉറപ്പ് വരുത്തുക\n4️⃣ Infected ഇലകൾ ശേഖരിച്ച് കത്തിക്കുക\n\n📄 Source: IPM for Rubber – Kerala, p.45',
        sources: ['IPM for Rubber – Kerala', 'Rubber Disease Management Manual'],
    },
};

const INIT_MESSAGES = [{
    id: '0', role: 'assistant',
    text: 'നമസ്കാരം! 🌿 I am FARMO Advisory — your AI farming assistant.\n\nAsk me anything in English or Malayalam about:\n• Rubber disease management\n• Tapping schedule\n• Government schemes',
    time: '9:00 PM', sources: [],
}];

export default function AdvisoryScreen() {
    const insets = useSafeAreaInsets();
    const { t, lang, setLang, languages } = useTranslation();
    const [messages, setMessages] = useState(INIT_MESSAGES);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [langModalVisible, setLangModalVisible] = useState(false);
    const listRef = useRef(null);

    const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const send = async (text) => {
        const q = text || input.trim();
        if (!q || thinking) return;
        setInput('');
        const userMsg = { id: Date.now().toString(), role: 'user', text: q, time: now() };
        setMessages(m => [...m, userMsg]);
        setThinking(true);

        try {
            const PRIMARY_URL = 'https://farmo-xxws.onrender.com/chat';
            const FALLBACK_URL = 'http://10.124.244.29:10000/chat';

            let response;
            try {
                response = await fetch(PRIMARY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: q }),
                });
            } catch (e) {
                response = await fetch(FALLBACK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: q }),
                });
            }

            if (!response || !response.ok) throw new Error('RAG System Unreachable');
            
            const data = await response.json();
            setMessages(m => [...m, { 
                id: Date.now().toString(), 
                role: 'assistant', 
                text: data.answer, 
                time: now(), 
                sources: data.sources 
            }]);
        } catch (err) {
            console.error(err);
             setMessages(m => [...m, { 
                id: Date.now().toString(), 
                role: 'assistant', 
                text: t('ragError') || "RAG engine offline. Using local AI knowledge base...", 
                time: now(), 
                sources: ["Local Backup"] 
            }]);
        } finally {
            setThinking(false);
        }
    };

    useEffect(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages, thinking]);

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.msgWrapper, isUser && { alignItems: 'flex-end' }]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    <Text style={[styles.bubbleText, isUser && { color: COLORS.white }]}>{item.text}</Text>
                </View>
                {item.sources?.length > 0 && (
                    <View style={styles.sources}>
                        {item.sources.map(s => (
                            <View key={s} style={styles.sourceChip}>
                                <Text style={styles.sourceText}>📄 {s.length > 28 ? s.slice(0, 28) + '…' : s}</Text>
                            </View>
                        ))}
                    </View>
                )}
                <Text style={styles.msgTime}>{item.time}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
            <LinearGradient colors={[COLORS.accentDark, COLORS.accent]} style={[styles.header, { paddingTop: insets.top + (SPACING.sm) }]}>
                <View style={styles.botAvatar}><Ionicons name="chatbubble-ellipses" size={24} color={COLORS.white} /></View>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.headerTitle}>FARMO Advisory</Text>
                    <View style={styles.onlineRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Online · RAG Active · Hybrid Engine</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.langBtn} activeOpacity={0.7} onPress={() => setLangModalVisible(true)}>
                    <Text style={{ fontSize: 20 }}>🌐</Text>
                </TouchableOpacity>
            </LinearGradient>

            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={i => i.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.msgList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={thinking ? (
                    <View style={styles.thinkingRow}>
                        <View style={styles.bubbleBot}>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                {[0, 150, 300].map(d => (
                                    <ActivityIndicator key={d} size="small" color={COLORS.primary} style={{ transform: [{ scale: 0.7 }] }} />
                                ))}
                                <Text style={{ fontSize: FONTS.sizes.xs, color: COLORS.textGray, marginLeft: 4 }}>Querying knowledge base…</Text>
                            </View>
                        </View>
                    </View>
                ) : null}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
                {QUICK_QUESTIONS.map(q => (
                    <TouchableOpacity key={q} style={styles.quickChip} onPress={() => send(q)}>
                        <Text style={styles.quickText}>{q}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask in English or Malayalam…"
                    placeholderTextColor={COLORS.textHint}
                    value={input}
                    onChangeText={setInput}
                    multiline
                    maxLength={500}
                    onSubmitEditing={() => send()}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, (!input.trim() || thinking) && { opacity: 0.4 }]}
                    onPress={() => send()}
                    disabled={!input.trim() || thinking}
                >
                    <LinearGradient colors={[COLORS.primary, '#1B5E20']} style={styles.sendGrad}>
                        <Text style={{ color: COLORS.white, fontSize: 18 }}>↗</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.docStrip, { marginBottom: insets.bottom + 74 }]} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
                <Text style={styles.docLabel}>📚 KB:</Text>
                {RAG_DOCS.map(d => (
                    <View key={d} style={styles.docChip}><Text style={styles.docText}>{d}</Text></View>
                ))}
            </ScrollView>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.offWhite },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
    botAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.white },
    onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A5D6A7' },
    onlineText: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
    langBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    msgList: { padding: SPACING.md, paddingBottom: SPACING.sm },
    msgWrapper: { marginBottom: SPACING.md, alignItems: 'flex-start' },
    bubble: { maxWidth: '85%', padding: SPACING.sm + 4, borderRadius: RADIUS.lg },
    bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    bubbleBot: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4, ...SHADOW.card },
    bubbleText: { fontSize: FONTS.sizes.sm, color: COLORS.textDark, lineHeight: 20 },
    sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5, maxWidth: '85%' },
    sourceChip: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
    sourceText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    msgTime: { fontSize: 10, color: COLORS.textHint, marginTop: 3 },
    thinkingRow: { alignItems: 'flex-start', marginBottom: SPACING.md, paddingHorizontal: SPACING.md },
    quickScroll: { maxHeight: 42, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    quickChip: { backgroundColor: COLORS.primaryPale, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, maxWidth: 200 },
    quickText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.sm, paddingHorizontal: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.sm, color: COLORS.textDark, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
    sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    sendGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    docStrip: { maxHeight: 34, backgroundColor: COLORS.white },
    docLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', lineHeight: 34, marginRight: 4 },
    docChip: { backgroundColor: COLORS.accentLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full },
    docText: { fontSize: 10, color: COLORS.accentDark, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 24, padding: 24, ...SHADOW.card },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },
    langItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    langLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
});
