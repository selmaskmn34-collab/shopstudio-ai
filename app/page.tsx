'use client';

import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      setResult(data.text || 'Açıklama üretilemedi.');
    } catch (error) {
      setResult('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-2 text-center text-indigo-400">ShopStudio AI</h1>
      <p className="text-slate-400 mb-8 text-center">E-Ticaret Görsel Analizi & SEO İçerik Üreticisi</p>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors cursor-pointer bg-slate-950/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
        </div>

        {image && (
          <div className="flex flex-col items-center space-y-4">
            <img src={image} alt="Yüklenen Ürün" className="max-h-64 rounded-lg object-contain border border-slate-800" />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Yapay Zeka Görseli İnceliyor...' : '✨ Ürün İçin SEO Metinleri Üret'}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h2 className="text-lg font-semibold text-indigo-400 mb-2">Yapay Zeka Analiz Sonucu:</h2>
            <p className="whitespace-pre-line text-slate-200 leading-relaxed">{result}</p>
          </div>
        )}
      </div>
    </main>
  );
}
