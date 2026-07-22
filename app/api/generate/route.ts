import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt || "Profesyonel Ürün";

    // 🔑 Not Defteri'ne kaydettiğin API Anahtarını iki tırnak arasına yapıştır:
    const GEMINI_API_KEY = "BURAYA_AQ_ILE_BASLAYAN_ANAHTARI_YAPISTIR";

    let seoContent = {
      title: `${prompt} - Özel Tasarım Premium Ürün`,
      description: `${prompt} için profesyonel e-ticaret stüdyo çekimi. Yüksek kaliteli malzeme ve modern tasarım.`,
      tags: ["ecommerce", "studio", "ai", "trend", "fashion"]
    };

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "BURAYA_AQ_ILE_BASLAYAN_ANAHTARI_YAPISTIR") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

        // 🚨 Google bir hata döndürürse hatayı doğrudan sitede açıklama kısmına yazdırıyoruz:
        if (geminiData?.error) {
          seoContent.description = `Google Gemini Hatası: ${geminiData.error.message || 'API Anahtarı Geçersiz'}`;
        } else if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          seoContent = JSON.parse(cleanJson);
        }
      } catch (e: any) {
        seoContent.description = `Bağlantı Hatası: ${e?.message || 'İstek gönderilemedi'}`;
      }
    }

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
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
