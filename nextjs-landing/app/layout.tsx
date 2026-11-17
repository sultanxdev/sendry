import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--display',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--body',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--mono',
});

export const metadata: Metadata = {
  title: 'Sendry | Track every API hit with zero overhead',
  description:
    'Sendry is open-source API monitoring on RabbitMQ, MongoDB and PostgreSQL. Add one Express middleware and see latency, errors and traffic without slowing your API.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%231FD27A'/%3E%3Cpath d='M26 16h-5l-4 9-5-18-4 9H6' fill='none' stroke='%230E1512' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${instrumentSans.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

