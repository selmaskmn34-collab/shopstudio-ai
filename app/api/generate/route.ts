import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let cleanPrompt = "Leopar Desen Sweatshirt";

    // 1. İstek tipine göre (JSON veya FormData) veriyi güvenle çekelim
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      const raw = body?.prompt || body?.text || body?.description || body?.concept || body?.name;
      if (raw) cleanPrompt = String(raw);
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        const raw = formData.get('prompt') || formData.get('text') || formData.get('name') || formData.get('file');
        if (raw && typeof raw === 'string') cleanPrompt = raw;
      }
    }

    // Dosya uzantılarını temizle (.jpg, .png vb.)
    cleanPrompt = cleanPrompt.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim();
    if (!cleanPrompt) cleanPrompt = "Leopar Desen Sweatshirt";

    // 🔑 Google Gemini API Anahtarın (AQ...)
    const GEMINI_API_KEY = "AQ.Ab8RN6IAQZHJpEL4NQRxDEsV7EGHORPBZGM10pO92nz7LuxmRQ";

    // 2. Akıllı Yedek SEO İçeriği (Hata durumunda asla boş dönmemesi için)
    let title = `${cleanPrompt.toUpperCase()} - Premium Trend Tasarım`;
    let description = `${cleanPrompt} ile tarzınızı öne çıkarın. Yüksek kaliteli kumaş dokusu, rahat kesimi ve modern detayları sayesinde hem günlük kombinlerinizde hem de sokak stilinde mükemmel şıklık sunar. E-ticaret ve pazaryeri satışları için özel olarak hazırlanmıştır.`;
    let tags = Array.from(new Set([
      ...cleanPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      "sweatshirt", "streetstyle", "trend", "giyim", "moda", "pazaryeri"
    ])).slice(0, 6);

    // 3. Gemini API Çağrısı
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "BURAYA_AQ_ILE_BASLAYAN_ANAHTARI_YAPISTIR") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Bu e-ticaret ürünü için Türkçe profesyonel SEO başlığı, detaylı açıklama ve 5 etiket üret. Ürün adı: "${cleanPrompt}". Yanıtı SADECE geçerli bir JSON objesi olarak ver: {"title": "...", "description": "...", "tags": ["tag1", "tag2"]}`
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.title) title = parsed.title;
              if (parsed.description) description = parsed.description;
              if (parsed.tags && Array.isArray(parsed.tags)) tags = parsed.tags;
            }
          }
        }
      } catch (e) {
        console.error('Gemini API Baglanti Hatasi:', e);
      }
    }

    // 4. Stüdyo Çekimi Görseli (Pollinations AI)
    const encodedPrompt = encodeURIComponent(`Professional commercial product photography, studio setup, ${cleanPrompt}, 4k ultra detailed`);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    return NextResponse.json({
      success: true,
      title,
      description,
      tags,
      imageUrl: generatedImageUrl,
      data: {
        title,
        description,
        tags,
        imageUrl: generatedImageUrl
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
