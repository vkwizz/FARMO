import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'FARMO – AI-Powered Rubber Plantation Management',
  description: 'Generative AI multi-agent system for small-scale rubber and coconut farmers in Kerala. Crop health monitoring, market intelligence, and Malayalam advisory services.',
  keywords: 'rubber plantation, AI farming, Kerala agriculture, crop disease detection, multi-agent AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500;600&family=Noto+Sans+Telugu:wght@400;500;600&family=Noto+Sans+Kannada:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
