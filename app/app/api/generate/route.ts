import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gereklidir.' }, { status: 400 });
    }

    // 1. Google Gemini API ile SEO Metin Üretimi ($0 Maliyet)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Bu e-ticaret ürünü için Etsy/Amazon uyumlu Türkçe profesyonel başlık, detaylı açıklama ve 5 etiket üret. Konsept: "${prompt}". Sadece şu formatta geçerli bir JSON döndür: {"title": "...", "description": "...", "tags": ["tag1", "tag2"]}`
            }]
          }]
        })
      }
    );

    const geminiData = await geminiRes.json();
    let seoContent = {
      title: "Profesyonel Ürün Çekimi",
      description: prompt,
      tags: ["ecommerce", "studio", "ai"]
    };

    try {
      const rawText = geminiData.candidates[0].content.parts[0].text;
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      seoContent = JSON.parse(cleanJson);
    } catch (e) {
      console.log("JSON Parse fallback triggered");
    }

    // 2. Pollinations AI ile Ücretsiz Stüdyo Görseli ($0 Maliyet)
    const encodedPrompt = encodeURIComponent(`Professional commercial product photography, studio setup, ${prompt}, 4k ultra detailed`);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: generatedImageUrl,
        ...seoContent
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'İşlem sırasında sunucu hatası oluştu.' }, { status: 500 });
  }
}
