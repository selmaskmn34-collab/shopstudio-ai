'use client';
import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Zap } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return alert('Lütfen ürün için bir konsept veya açıklama girin!');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.data);
    } catch (err: any) {
      alert(err.message || 'Bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-500 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ShopStudio AI
          </h1>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Kredi: <strong>5 Ücretsiz</strong></span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sol Kolon: Girdi Alanı */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Ürün Stüdyonuzu Oluşturun</h2>
          <p className="text-slate-400 text-sm">
            Ürününüzü tanımlayın; yapay zeka saniyeler içinde stüdyo arka planı, SEO başlığı ve açıklamasını üretsin.
          </p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Örn: Siyah oversized erkek hoodie, minimalist stüdyo ışığı, mermer zemin..."
            className="w-full h-32 p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 outline-none text-sm resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Yapay Zeka Çalışıyor...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Stüdyo Görseli & SEO Üret ($0)</span>
              </>
            )}
          </button>
        </div>

        {/* Sağ Kolon: Sonuç Alanı */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center min-h-[350px]">
          {result ? (
            <div className="w-full space-y-4">
              <img
                src={result.imageUrl}
                alt="Üretilen Ürün"
                className="w-full h-64 object-cover rounded-xl border border-slate-800"
              />
              <div className="space-y-2">
                <h3 className="font-bold text-indigo-300">{result.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3">{result.description}</p>
                <div className="flex flex-wrap gap-1">
                  {result.tags?.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
              <p className="text-sm">Sonuç burada görünecek</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
