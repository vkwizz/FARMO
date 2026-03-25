'use client';
import React, { useState, useEffect } from 'react';
import advisoryData from '../advisory.json';

const CLASSES = [
  'Birds-eye', 'Colletorichum-leaf-disease', 'Corynespora', 
  'Dry_Leaf', 'Healthy', 'Pesta', 'Powdery-mildew'
];

const DiseasePredictor = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ort, setOrt] = useState(null);
    const [session, setSession] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Initialise ONNX Runtime on client side
    useEffect(() => {
        const initORT = async () => {
            try {
                const onnx = await import('onnxruntime-web');
                setOrt(onnx);
                const sess = await onnx.InferenceSession.create('/rubber_disease_model.onnx', {
                    executionProviders: ['webgl'], // Use WebGL if available
                    graphOptimizationLevel: 'all'
                });
                setSession(sess);
                console.log("ONNX Model Loaded successfully.");
            } catch (err) {
                console.error("Failed to load ONNX model:", err);
                alert("Please ensure rubber_disease_model.onnx is in public/ folder.");
            }
        };
        initORT();
    }, []);

    const softmax = (logits) => {
        const maxLogit = Math.max(...logits);
        const scores = logits.map(v => Math.exp(v - maxLogit));
        const den = scores.reduce((a, b) => a + b);
        return scores.map(v => v / den);
    };

    const preprocess = async (img) => {
        const canvas = document.createElement('canvas');
        const size = 224; // Standard for many CNN models
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const { data } = imageData; // RGBA array

        // Normalize: (x/255 - mean) / std
        const mean = [0.485, 0.456, 0.406];
        const std = [0.229, 0.224, 0.225];
        
        const float32Data = new Float32Array(3 * size * size);
        for (let i = 0; i < size * size; i++) {
            // R G B
            float32Data[i] = (data[i * 4] / 255.0 - mean[0]) / std[0]; // R
            float32Data[i + size * size] = (data[i * 4 + 1] / 255.0 - mean[1]) / std[1]; // G
            float32Data[i + 2 * size * size] = (data[i * 4 + 2] / 255.0 - mean[2]) / std[2]; // B
        }

        return new ort.Tensor('float32', float32Data, [1, 3, size, size]);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !session) return;
        
        setLoading(true);
        setResult(null);
        
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        const img = new Image();
        img.src = previewUrl;
        
        img.onload = async () => {
            try {
                // 2. Preprocess
                const inputTensor = await preprocess(img);
                
                // 3. Inference
                const feeds = {};
                feeds[session.inputNames[0]] = inputTensor;
                const outputs = await session.run(feeds);
                
                // Get the output name (usually 'output' or 'logits')
                const outputName = session.outputNames[0];
                const logits = outputs[outputName].data;
                
                // 4. Post-process
                const probabilities = softmax(logits);
                const maxIdx = probabilities.indexOf(Math.max(...probabilities));
                const disease = CLASSES[maxIdx];
                
                setResult({
                    disease: disease,
                    confidence: (probabilities[maxIdx] * 100).toFixed(2),
                    advisory: advisoryData[disease] || advisoryData["Healthy"]
                });
            } catch (err) {
                console.error("AI Error:", err);
                alert("Failed to analyze leaf: " + err.message);
            }
            setLoading(false);
        };
    };

    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: 'auto', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.2)', color: '#f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0', background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🍂 Rubber Leaf Scanner
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Upload a photo to detect diseases instantly</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: '2px dashed rgba(148, 163, 184, 0.3)', borderRadius: '16px', padding: '30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', position: 'relative' }}>
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px' }} />
                    ) : (
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                            <p style={{ fontWeight: 600 }}>Click to capture or upload</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                </div>

                {!session && <p style={{ color: '#fbbf24', textAlign: 'center' }}>⚙️ Initialising AI engine...</p>}
                
                {loading && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(56, 189, 248, 0.3)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ marginTop: '8px', fontWeight: 600, color: '#38bdf8' }}>🔍 Analyzing leaf patterns...</p>
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: '10px', animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(56, 189, 248, 0.1)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', color: result.disease === 'Healthy' ? '#34d399' : '#fb7185' }}>
                                    {result.disease}
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Confidence: {result.confidence}%</span>
                            </div>
                            <div style={{ fontSize: '24px' }}>{result.disease === 'Healthy' ? '✅' : '⚠️'}</div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#38bdf8', marginTop: 0, fontWeight: 700 }}>📋 Overview</h3>
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '4px 0 0 0', lineHeight: 1.5 }}>{result.advisory.overview}</p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#34d399', marginTop: 0, fontWeight: 700 }}>💊 Treatment</h3>
                                <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                    {result.advisory.treatment.map((t, i) => <li key={i} style={{ marginBottom: '4px' }}>{t}</li>)}
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#fbbf24', marginTop: 0, fontWeight: 700 }}>🛡️ Prevention</h3>
                                <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                    {result.advisory.prevention.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default DiseasePredictor;
