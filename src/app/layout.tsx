import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Prince Mwase — Full Stack Engineer | Distributed Systems',
    template: '%s | Prince Mwase',
  },
  description:
    'Full Stack Engineer from Malawi with 8+ years of experience building distributed systems, fintech platforms, and open-source tools. Creator of MW-JSON Standard, Quick Ticket, and the Malawi Knowledge Mesh.',
  keywords: [
    'Prince Mwase',
    'Full Stack Engineer',
    'Distributed Systems',
    'Malawi',
    'Go',
    'TypeScript',
    'React',
    'Open Source',
    'MW-JSON',
    'Knowledge Graph',
  ],
  authors: [{ name: 'Prince Mwase', url: 'https://princemwase.me' }],
  creator: 'Prince Mwase',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://princemwase.me',
    siteName: 'Prince Mwase',
    title: 'Prince Mwase — Full Stack Engineer | Distributed Systems',
    description:
      'Full Stack Engineer from Malawi with 8+ years building distributed systems and open-source tools.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@MwaseSparrow',
    title: 'Prince Mwase — Full Stack Engineer',
    description:
      'Full Stack Engineer from Malawi. Building distributed systems and open-source tools.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#090b10" />
      </head>
      <body className="antialiased">
        {/* Animated mesh background */}
        <div className="mesh-bg" aria-hidden="true" />

        {/* Main content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
