import "./globals.css";

export const metadata = {
  title: "Tradelia",
  description: "tradelia.org",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
