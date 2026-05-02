import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { InstallButton } from "@/components/pwa/install-button";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Trusted supplier of medical student kits, professional diagnostic tools, facility equipment and patient supplies across Kenya. Deliveries within 24 hours to 4 working days. Authentic products, competitive prices.",
  applicationName: SITE_NAME,
  keywords: [
    "medical supplies Kenya",
    "stethoscope Nairobi",
    "hospital equipment",
    "medical student kit",
    "PPE Kenya",
    "diagnostic tools",
    "blood pressure monitor",
    "medical scrubs",
    "Safian Healthcare",
    "healthcare supplies Nairobi",
    "medical equipment Kenya",
  ],
  authors: [{ name: "Safian Healthcare & Medical Supplies" }],
  creator: "Safian Healthcare",
  publisher: "Safian Healthcare",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Trusted supplier of medical student kits, professional diagnostic tools, facility equipment and patient supplies across Kenya.",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Safian Healthcare & Medical Supplies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Trusted supplier of medical supplies across Kenya. Deliveries within 24 hours to 4 working days. Authentic products.",
    images: ["/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.jpeg", type: "image/jpeg" },
    ],
    apple: "/logo.jpeg",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  verification: {
    google: "JdB8BuLtA5bibFfdPTiQJ0URBMY9_5_hyGa_KJcStsQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Safian Healthcare" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('safian-theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <MobileBottomBar />
        <WhatsAppFab />
        <InstallButton />
        <ServiceWorkerRegister />
        <Toaster />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
