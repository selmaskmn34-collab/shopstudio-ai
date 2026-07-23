import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let cleanPrompt = "Özel Tasarım Ürün";
    const contentType = req.headers.get('content-type') || '';

    try {
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const fileEntry = formData.get('file') || formData.get('image');
        const textEntry = formData.get('prompt') || formData.get('text') || formData.get('name');

        if (fileEntry && typeof fileEntry === 'object' && 'name' in fileEntry) {
          cleanPrompt = (fileEntry as File).name;
        } else if (textEntry && typeof textEntry === 'string') {
          cleanPrompt = textEntry;
        }
      } else {
        const body = await req.json().catch(() => ({}));
        const raw = body?.prompt || body?.text || body?.description || body?.concept || body?.name;
        if (raw && typeof raw === 'string') cleanPrompt = raw;
      }
    } catch {
      console.log("Veri okuma esnek modda devam ediyor.");
    }

    cleanPrompt = String(cleanPrompt)
      .replace(/\.(png|jpg|jpeg|webp|gif|svg)$/gi, '')
      .replace(/[-_]/g, ' ')
      .trim();

    if (!cleanPrompt || cleanPrompt.length < 2) {
      cleanPrompt = "Sokak Stili Sweatshirt";
    }

    const capitalized = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
    let title = `${capitalized} | Özel Tasarım & Premium Kalite`;
    let description = `${capitalized} modeli, yüksek kaliteli kumaş yapısı ve modern tasarım detaylarıyla öne çıkar. Günlük kullanım ve sokak stili için ideal olan bu ürün, konforlu bir deneyim sunar. E-ticaret stüdyo çekim standartlarına uygun olarak tasarlanmış ve listelenmiştir.`;
    
    const words = cleanPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const tags = Array.from(new Set([...words, "sokakstili", "moda", "trend", "tasarim", "giyim", "kombin"])).slice(0, 7);

    // TypeScript ES versiyon hatası vermeyen, "s" bayraksız güvenli AI okuma:
    try {
      const aiPrompt = encodeURIComponent(`E-ticaret için "${cleanPrompt}" ürününe profesyonel Türkçe SEO başlığı ve 2 cümlelik çekici bir açıklama yaz. Format: Başlık: [başlık] Açıklama: [açıklama]`);
      const aiRes = await fetch(`https://text.pollinations.ai/${aiPrompt}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (aiRes.ok) {
        const aiText = await aiRes.text();
        if (aiText && aiText.length > 20 && !aiText.includes("Error") && !aiText.includes("üretilemedi")) {
          // "s" bayrağı yerine [\s\S]* kullanarak tüm TypeScript versiyonlarıyla %100 uyumlu yaptık:
          const descMatch = aiText.match(/Açıklama:\s*([\s\S]*?)(?:Etiketler:|$)/i);
          if (descMatch && descMatch[1]) {
            description = descMatch[1].replace(/["*]/g, '').trim();
          }
          const titleMatch = aiText.match(/Başlık:\s*([\s\S]*?)(?:Açıklama:|$)/i);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace(/["*]/g, '').trim();
          }
        }
      }
    } catch {
      console.log("Dış AI servisi yanıt vermedi, yerel akıllı içerik devreye alındı.");
    }

    const encodedPrompt = encodeURIComponent(`Professional commercial product photography, studio setup, ${cleanPrompt}, 4k ultra detailed, studio lighting`);
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

    return NextResponse.json({
      success: true,
      title,
      description,
      text: description,
      content: description,
      tags,
      imageUrl: generatedImageUrl,
      data: {
        title,
        description,
        text: description,
        tags,
        imageUrl: generatedImageUrl
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({
      success: true,
      title: "Özel Tasarım Ürün - Yeni Sezon",
      description: "Yüksek kaliteli malzemeden üretilmiş, modern tasarım detaylarına sahip trend e-ticaret ürünü. Günlük kullanım için konforlu ve şık bir seçenek sunar.",
      tags: ["moda", "trend", "giyim", "tasarim", "style"],
      imageUrl: "https://image.pollinations.ai/prompt/professional%20product%20photography%20studio?width=1024&height=1024&nologo=true",
      data: {
        title: "Özel Tasarım Ürün - Yeni Sezon",
        description: "Yüksek kaliteli e-ticaret ürünü.",
        tags: ["moda", "trend", "giyim"],
        imageUrl: "https://image.pollinations.ai/prompt/professional%20product%20photography%20studio?width=1024&height=1024&nologo=true"
      }
    }, { status: 200 });
  }
}
