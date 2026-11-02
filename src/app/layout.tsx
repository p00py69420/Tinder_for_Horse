import type { Metadata } from 'next';
import { Navigation } from '@/components/nav';
import './globals.css';
import './analysis.css';

export const metadata: Metadata = {
  title: 'AduuMatch | Монгол адууны бүртгэл, угшил, үржлийн сан',
  description: 'Монгол адууны бүртгэл, угшил болон үржлийн нээлттэй сан.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body><div className="site-shell"><header className="site-header"><a className="brand" href="/" aria-label="AduuMatch нүүр"><span className="brand-mark">А</span><span>AduuMatch<small>МОНГОЛ АДУУНЫ САН</small></span></a><Navigation /></header><main>{children}</main><footer className="site-footer"><span>AduuMatch</span><span>Бүртгэлд суурилсан мэдээлэл. Үржлийн үр дүнгийн баталгаа биш.</span></footer></div></body></html>;
}