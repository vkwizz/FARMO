import React, { createContext, useState, useContext } from 'react';

const translations = {
    en: {
        hello: "Hello",
        scannow: "Scan Leaf",
        soil: "Soil",
        light: "Light",
        humidity: "Humidity",
        temp: "Temp",
        symptoms: "Symptoms",
        analyzeText: "Analyze",
        resultLabel: "Disease Found",
        treatmentLabel: "Advisory",
        accuracyTitle: "Agent Accuracy",
        viewAll: "View All",
        market: "Market Rates",
        weather: "Weather Info",
        ragError: "RAG engine offline. Using backup knowledge...",
    },
    ml: {
        hello: "നമസ്കാരം",
        scannow: "ഇല പരിശോധിക്കുക",
        soil: "മണ്ണ്",
        light: "പ്രകാശം",
        humidity: "ഈർപ്പം",
        temp: "താപനില",
        symptoms: "ലക്ഷണങ്ങൾ",
        analyzeText: "പരിശോധിക്കുക",
        resultLabel: "രോഗം കണ്ടെത്തി",
        treatmentLabel: "ഉപദേശം",
        accuracyTitle: "കൃത്യത",
        viewAll: "കൂടുതൽ",
        market: "വിപണി നിരക്ക്",
        weather: "കാലാവസ്ഥ",
        ragError: "എഞ്ചിൻ ഓഫ്‌ലൈനിലാണ്. ബാക്കപ്പ് ഉപയോഗിക്കുന്നു...",
    },
    hi: {
        hello: "नमस्ते",
        scannow: "पत्ता स्कैन करें",
        soil: "मिट्टी",
        light: "प्रकाश",
        humidity: "नमी",
        temp: "तापमान",
        symptoms: "लक्षण",
        analyzeText: "विश्लेषण करें",
        resultLabel: "रोग मिला",
        treatmentLabel: "परामर्श",
        accuracyTitle: "सटीकता",
        viewAll: "सब देखें",
        market: "बाज़ार भाव",
        weather: "मौसम की जानकारी",
        ragError: "इंजन ऑफलाइन है। बैकअप का उपयोग कर रहा है...",
    },
    ta: {
        hello: "வணக்கம்",
        scannow: "இலையை ஸ்கேன் செய்க",
        soil: "மண்",
        light: "ஒளி",
        humidity: "ஈரப்பதம்",
        temp: "வெப்பநிலை",
        symptoms: "அறிகுறிகள்",
        analyzeText: "பகுப்பாய்வு",
        resultLabel: "நோய் கண்டறியப்பட்டது",
        treatmentLabel: "ஆலோசனை",
        accuracyTitle: "துல்லியம்",
        viewAll: "அனைத்தையும்",
        market: "சந்தை விலை",
        weather: "வானிலை",
        ragError: "இயந்திரம் ஆஃப்லைனில் உள்ளது. காப்புப்பிரதியைப் பயன்படுத்துகிறது...",
    }
};


const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    const t = (key) => translations[lang][key] || key;

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
        { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
        { code: 'ta', label: 'Tamil', flag: '🇮🇳' }
    ];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, languages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
