import type { Metadata, Viewport } from "next";
import { Noto_Sans_Mono } from "next/font/google";
import { PwaRegistration } from "@/components/PwaRegistration";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./settings.css";
import "./pai-overrides.css";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAI",
  description: "A phone-first interface for the pi coding agent",
  applicationName: "PAI",
  manifest: "/manifest.webmanifest",
  icons: {
    // The build stamp is here because Safari keeps a touch icon per site and
    // will not refetch a URL it already has. Next fingerprints favicon.ico on
    // its own but leaves these alone, so a changed mark reached the tab and
    // never the home screen. An icon that already sits on a home screen is
    // still fixed at the moment it was added -- nothing served can move it --
    // but this is what lets the next install pick the change up.
    icon: [
      {
        url: `/icons/icon-192.png?v=${process.env.NEXT_PUBLIC_PAI_BUILD ?? "dev"}`,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `/icons/apple-touch-icon.png?v=${process.env.NEXT_PUBLIC_PAI_BUILD ?? "dev"}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${notoSansMono.variable} notranslate`} suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body translate="no" className="notranslate" suppressHydrationWarning>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
