import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vantage.Intel — Prediction Market Trader Dashboard',
  description: 'Autonomous prediction market intelligence with Arc execution via Circle Agent Stack',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
