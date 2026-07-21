import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ShopStudio AI',
  description: 'E-ticaret Yapay Zeka Ürün Stüdyosu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
