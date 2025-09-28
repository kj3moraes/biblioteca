import type { Metadata } from 'next';
import { NavMenu } from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biblioteca',
  description:
    'A web app to automatically ingest and find books in bookstores.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/images/icon.png' />
      </head>
      <body className='min-h-screen'>
        <main className='relative h-screen'>
          <NavMenu />
          {children}
        </main>
      </body>
    </html>
  );
}
