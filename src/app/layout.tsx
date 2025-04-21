import Navbar from '@/components/Navbar';
import "./globals.css";
import { Poppins } from 'next/font/google';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CouponHub',
  description: 'Find the best coupons and deals, updated daily.',
};


const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="font-sans antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
