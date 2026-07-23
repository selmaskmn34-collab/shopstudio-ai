'use client';

import React, { useState } from 'react';

// TypeScript için kesin veri tipi tanımı (Derleme hatasını engeller)
interface ResultData {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || 'Özel Tasarım Ürün' }),
      });

      const data = await res.json();

      if (data && (data.success || data.description || data.text)) {
        const uretilenMetin = data.description || data.text || data.content || data.result || 'Açıklama üretildi.';
        setResult({
          title: data.title || data.data?.title || 'Özel Tasarım Ürün',
          description: uretilenMetin,
          tags: data.tags || data.data?.tags || ['giyim', 'moda', 'trend'],
          imageUrl: data.imageUrl || data.data?.imageUrl,
        });
      } else {
        setErrorMsg('Sunucu yanıt verdi ancak veri işlenemedi.');
      }
    } catch (err) {
      setErrorMsg('Bağlantı Hatası: İstek gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>ShopStudio AI - Stüdyo & SEO Üretici</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Ürün Adı veya Konsept:
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: 2 iplik şardonlu renkli leopar desen sweatshirt"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '✨ Yapay Zeka Üretiyor...' : '✨ Stüdyo Görseli & SEO Üret'}
        </button>
      </form>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {result && (
        <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', background: '#fafafa' }}>
          <h2>{result.title}</h2>
          <p style={{ marginTop: '1rem', lineHeight: '1.6' }}><strong>Açıklama:</strong> {result.description}</p>
          
          {result.tags && result.tags.length > 0 && (
            <div style={{ margin: '1rem 0' }}>
              <strong>Etiketler:</strong>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {result.tags.map((tag: string, idx: number) => (
                  <span key={idx} style={{ background: '#e0e0e0', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.imageUrl && (
            <div style={{ marginTop: '1.5rem' }}>
              <strong>Üretilen Stüdyo Görseli:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                <img
                  src={result.imageUrl}
                  alt="Üretilen Görsel"
                  style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
