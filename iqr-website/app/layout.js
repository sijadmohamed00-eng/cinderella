export const metadata = {
  title: "IQR | لإدارة وتطوير المطاعم في العراق",
  description: "الشركة الأولى لإدارة وتطوير المطاعم في العراق — نحول فوضى مطعمك إلى دقة هندسية ذاتية",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000814" }}>
        {children}
      </body>
    </html>
  );
}
