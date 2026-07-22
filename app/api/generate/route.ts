import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body?.prompt || "Profesyonel Ürün";

    // 🔑 Not Defteri'ndeki "AQ..." ile başlayan yeni Auth API anahtarın:
    const GEMINI_API_KEY = "AQ.Ab8RN6IAQZHJpEL4NQRxDEsV7EGHORPBZGM10pO92nz7LuxmRQ";

    let seoContent = {
      title: `${prompt} - Özel Tasarım Premium Ürün`,
      description: `${prompt} için profesyonel e-ticaret stüdyo çekimi. Yüksek kaliteli malzeme ve modern tasarım.`,
      tags: ["ecommerce", "studio", "ai", "trend", "fashion"]
    };

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "AQ.Ab8RN6IAQZHJpEL4NQRxDEsV7EGHORPBZGM10pO92nz7LuxmRQ") {
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
                  text: `Bu e-ticaret ürünü için Etsy/Amazon uyumlu Türkçe profesyonel başlık, detaylı açıklama ve 5 etiket üret. Konsept: "${prompt}". Sadece geçerli bir JSON objesi döndür: {"title": "...", "description": "...", "tags": ["tag1", "tag2"]}`
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        const geminiData = await geminiRes.json();

        if (geminiData?.error) {
          seoContent.description = `Google Mesajı: ${geminiData.error.message}`;
        } else if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            seoContent = JSON.parse(jsonMatch[0]);
          }
        } else {
          seoContent.description = `Yanıt Formattı Uymadı: ${JSON.stringify(geminiData)}`;
        }
      } catch (e: any) {
        seoContent.description = `Bağlantı Hatası: ${e?.message || 'Sunucuya ulaşılamadı'}`;
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
