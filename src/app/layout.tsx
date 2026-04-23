import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "SAFIAN HEALTHCARE & MEDICAL SUPPLIES — medical supplies, healthcare equipment, and home-based care solutions. Fast delivery across Kenya.",
  applicationName: SITE_NAME,
  keywords: [
    "medical supplies",
    "stethoscope Kenya",
    "hospital equipment",
    "medical student kit",
    "PPE",
    "Safian Healthcare",
  ],
  openGraph: {
    type: "website",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Shop medical supplies, healthcare equipment, and home-based care solutions.",
    images: ["/logo.jpeg"],
  },
  icons: { icon: "/logo.jpeg", apple: "/logo.jpeg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <MobileBottomBar />
        <WhatsAppFab />
      </body>
    </html>
  );
}
