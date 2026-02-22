import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>📞 +2659844447749  |  ✉️ kimencebeauty@example.com</p>
      <p className="site-social">
        <Link href="#" aria-label="Instagram">
          Instagram
        </Link>
        <Link href="#" aria-label="Facebook">
          Facebook
        </Link>
        <Link href="#" aria-label="TikTok">
          TikTok
        </Link>
      </p>
      <p>© 2026 Kimence Beauty Studio — All rights reserved.</p>
    </footer>
  );
}
