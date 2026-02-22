import { Montserrat, Playfair_Display } from "next/font/google";

import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import "./site.css";

const siteBodyFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--site-font-body",
});

const siteDisplayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--site-font-display",
});

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`site-root ${siteBodyFont.variable} ${siteDisplayFont.variable}`}>
      <SiteHeader />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
