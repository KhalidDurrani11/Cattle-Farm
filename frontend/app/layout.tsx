import type { Metadata } from 'next';
import { Open_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { ThemeProvider } from '@/components/ThemeProvider';

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Cattle Farm Trading — Pakistan Cattle Marketplace',
  description: "Pakistan's #1 online cattle marketplace. Buy and sell bulls, cows, buffaloes, and goats. Trusted by thousands of farmers across Pakistan.",
  keywords: 'cattle, mawashi, Pakistan, buy cow, sell bull, buffalo, goat, farmer, kissan',
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${openSans.variable} ${playfair.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
            <AuthProvider>
              <LanguageProvider>
                <Header />
                <main className="min-h-screen">{children}</main>
                <Footer />
              </LanguageProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
