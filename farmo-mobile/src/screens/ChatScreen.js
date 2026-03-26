import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { sendMessage } from "../services/groqChat";

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your rubber plantation assistant. Ask me anything about diseases, treatments, or farming practices!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessage(input);
      const botMsg = { role: "bot", text: reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errMsg = { role: "bot", text: "Something went wrong. Please try again." };
      setMessages(prev => [...prev, errMsg]);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>🌿 Plantation Assistant</Text>
      </View>

      <ScrollView
        style={styles.messages}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={msg.role === "user" ? styles.userBubble : styles.botBubble}
          >
            <Text style={msg.role === "user" ? styles.userText : styles.botText}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.botBubble}>
            <ActivityIndicator size="small" color="#2d6a4f" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your rubber plantation..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f0" },
  header: {
    backgroundColor: "#2d6a4f",
    padding: 16,
    paddingTop: 48,
    alignItems: "center"
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  messages: { flex: 1, padding: 16 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2d6a4f",
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    marginBottom: 8,
    maxWidth: "80%"
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 8,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  userText: { color: "#fff", fontSize: 14 },
  botText: { color: "#333", fontSize: 14 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    color: "#333"
  },
  sendBtn: {
    backgroundColor: "#2d6a4f",
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: "center"
  },
  sendBtnDisabled: { backgroundColor: "#aaa" },
  sendText: { color: "#fff", fontWeight: "bold" }
});