import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StyleSheet,
  KeyboardAvoidingView, Platform, Modal
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from "../theme";
import { sendMessage } from "../services/groqChat";
import { useTranslation } from "../contexts/LanguageContext";

const QUICK_QUESTIONS = [
  "Best time to tap rubber?",
  "Powdery mildew treatment?",
  "How to improve latex yield?",
  "Signs of root rot?",
  "Fertilizer schedule for rubber?",
];

const INIT_MESSAGES = [
  {
    id: "0",
    role: "bot",
    text: "നമസ്കാരം! 🌿 I am FARMO's AI Assistant powered by Groq.\n\nAsk me anything in English or Malayalam about:\n• Rubber disease management\n• Tapping schedule & yield\n• Treatment & fertilizers",
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { setLang, languages } = useTranslation();
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const listRef = useRef(null);

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleSend = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;

    const userMsg = { id: Date.now().toString(), role: "user", text: q, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessage(q);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", text: reply, time: now() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "⚠️ Unable to connect. Please check your internet and try again.",
          time: now(),
        },
      ]);
    }

    setLoading(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgWrapper, isUser && { alignItems: "flex-end" }]}>
        {!isUser && (
          <View style={styles.botAvatarSmall}>
            <Text style={{ fontSize: 12 }}>🌿</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && { color: COLORS.white }]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.msgTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0F4D31", "#166534"]}
        style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}
      >
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.white} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.headerTitle}>FARMO AI Assistant</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online · Powered by Groq · LLaMA 3.3</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          activeOpacity={0.7}
          onPress={() => setLangModalVisible(true)}
        >
          <Text style={{ fontSize: 20 }}>🌐</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          loading ? (
            <View style={[styles.msgWrapper, { alignItems: "flex-start" }]}>
              <View style={styles.botAvatarSmall}>
                <Text style={{ fontSize: 12 }}>🌿</Text>
              </View>
              <View style={styles.bubbleBot}>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={{ fontSize: FONTS.sizes.xs, color: COLORS.textGray }}>
                    Thinking...
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Questions */}
      <FlatList
        horizontal
        data={QUICK_QUESTIONS}
        keyExtractor={(q) => q}
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.quickChip} onPress={() => handleSend(item)}>
            <Text style={styles.quickText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask in English or Malayalam..."
          placeholderTextColor={COLORS.textHint}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <LinearGradient colors={[COLORS.primary, "#1B5E20"]} style={styles.sendGrad}>
            <Ionicons name="send" size={18} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Language</Text>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    paddingBottom: SPACING.md,
  },
  botAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  botAvatarSmall: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primaryPale,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: { fontSize: FONTS.sizes.md, fontWeight: "800", color: COLORS.white },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#A5D6A7" },
  onlineText: { fontSize: 10, color: "rgba(255,255,255,0.8)" },
  langBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  msgList: { padding: SPACING.md, paddingBottom: SPACING.sm },
  msgWrapper: { marginBottom: SPACING.md, alignItems: "flex-start" },
  bubble: { maxWidth: "85%", padding: SPACING.sm + 4, borderRadius: RADIUS.lg },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    ...SHADOW.card,
  },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOW.card,
  },
  bubbleText: { fontSize: FONTS.sizes.sm, color: COLORS.textDark, lineHeight: 20 },
  msgTime: { fontSize: 10, color: COLORS.textHint, marginTop: 3 },
  quickScroll: {
    maxHeight: 42,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  quickChip: {
    backgroundColor: COLORS.primaryPale,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.full, maxWidth: 200,
  },
  quickText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    gap: SPACING.sm, padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textDark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  sendGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    width: "80%", backgroundColor: "white",
    borderRadius: 24, padding: 24, ...SHADOW.card,
  },
  modalTitle: {
    fontSize: 20, fontWeight: "800",
    color: "#1a1a1a", marginBottom: 20, textAlign: "center",
  },
  langItem: {
    flexDirection: "row", alignItems: "center",
    gap: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  langLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
});