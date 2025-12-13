import "./globals.css";

export const metadata = {
  title: "AI-Powered CRO Audit Tool",
  description: "Improve your store conversion rate with Gemini & Firecrawl",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
