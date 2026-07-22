import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // 1. Gelen metni yakala ve .jpg / .png uzantılarını otomatik temizle
    let rawPrompt = body?.prompt || body?.text || body?.description || body?.concept || "Leopar Desen Sweatshirt";
    const cleanPrompt = rawPrompt.replace(/\.(jpg|jpeg|png|webp)$/i, '').trim();

    // 🔑 SADECE BURADAKİ TIRNAKLARIN ARASINA YAPIŞTIR (Başka hiçbir yere dokunma):
    const GEMINI_API_KEY = "AQ.Ab8RN6IAQZHJpEL4NQRxDEsV7EGHORPBZGM10pO92nz7LuxmRQ";

    let title = `${cleanPrompt} - Özel Tasarım Premium Ürün`;
    let description = `${cleanPrompt} için profesyonel e-ticaret stüdyo çekimi. Yüksek kaliteli malzeme ve modern tasarım.`;
    let tags = ["ecommerce", "studio", "ai", "trend", "fashion"];

    if (GEMINI_API_KEY) {
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
                  text: `Bu e-ticaret ürünü için Etsy/Amazon uyumlu Türkçe profesyonel başlık, detaylı açıklama ve 5 etiket üret. Ürün: "${cleanPrompt}". Sadece geçerli bir JSON objesi döndür: {"title": "...", "description": "...", "tags": ["tag1", "tag2"]}`
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
          description = `Google Mesajı: ${geminiData.error.message}`;
        } else if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.title) title = parsed.title;
            if (parsed.description) description = parsed.description;
            if (parsed.tags) tags = parsed.tags;
          }
        }
      } catch (e: any) {
        description = `Bağlantı Hatası: ${e?.message || 'Sunucuya ulaşılamadı'}`;
      }
    }

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
