import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Top Up - ZeeBoost',
  description: 'Top up Robux dengan mudah dan aman'
};

export const viewport: Viewport = {
  themeColor: '#3b82f6'
};

export default function TopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}