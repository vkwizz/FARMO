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
        <div className="glass-card" style={{ maxWidth: '800px', margin: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--primary-green)', fontFamily: 'var(--font-heading)' }}>
                    🍂 Rubber Leaf Scanner
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '1rem', fontWeight: 500 }}>Upload a photo to detect diseases instantly</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ 
                    border: '2px dashed var(--gray-200)', 
                    borderRadius: '24px', 
                    padding: '40px', 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s', 
                    position: 'relative',
                    background: 'var(--bg-offwhite)'
                }}>
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '16px' }} />
                    ) : (
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
                            <p style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '1.1rem' }}>Click to capture or upload</p>
                            <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginTop: '4px' }}>Supports JPG, PNG, WEBP</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                </div>

                {!session && <p style={{ color: 'var(--amber-500)', textAlign: 'center', fontWeight: 600 }}>⚙️ Initialising AI engine...</p>}
                
                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '4px solid rgba(0, 109, 68, 0.1)', borderTopColor: 'var(--primary-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ marginTop: '12px', fontWeight: 700, color: 'var(--primary-green)' }}>🔍 Analyzing leaf patterns...</p>
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: '10px', animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: result.disease === 'Healthy' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(244, 63, 94, 0.08)', 
                            padding: '20px 24px', 
                            borderRadius: '20px', 
                            border: `1px solid ${result.disease === 'Healthy' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(244, 63, 94, 0.15)'}` 
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: result.disease === 'Healthy' ? '#15803d' : '#be123c' }}>
                                    {result.disease}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 600 }}>Confidence: {result.confidence}%</span>
                            </div>
                            <div style={{ fontSize: '32px' }}>{result.disease === 'Healthy' ? '✅' : '⚠️'}</div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'grid', gap: '20px' }}>
                            <div style={{ background: 'var(--bg-offwhite)', padding: '20px', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--sky-500)', marginTop: 0, fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>📋 Overview</h3>
                                <p style={{ fontSize: '1rem', color: 'var(--gray-700)', margin: '8px 0 0 0', lineHeight: 1.6 }}>{result.advisory.overview}</p>
                            </div>

                            <div style={{ background: 'var(--bg-offwhite)', padding: '20px', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--primary-green)', marginTop: 0, fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>💊 Treatment</h3>
                                <ul style={{ paddingLeft: '20px', margin: '12px 0 0 0', color: 'var(--gray-700)', fontSize: '1rem' }}>
                                    {result.advisory.treatment.map((t, i) => <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>{t}</li>)}
                                </ul>
                            </div>

                            <div style={{ background: 'var(--bg-offwhite)', padding: '20px', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--amber-500)', marginTop: 0, fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>🛡️ Prevention</h3>
                                <ul style={{ paddingLeft: '20px', margin: '12px 0 0 0', color: 'var(--gray-700)', fontSize: '1rem' }}>
                                    {result.advisory.prevention.map((p, i) => <li key={i} style={{ marginBottom: '8px', lineHeight: 1.5 }}>{p}</li>)}
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
