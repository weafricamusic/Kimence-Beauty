import Link from "next/link";

const heroImageUrl =
  "https://images.unsplash.com/photo-1611861914530-3a3f6e2c110d?auto=format&fit=crop&w=1600&q=80";

function Card({
  title,
  description,
  price,
}: {
  title: string;
  description: string;
  price: string;
}) {
  return (
    <div className="site-service-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="price">{price}</span>
    </div>
  );
}

export default async function HomePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return (
      <div className="site-container">
        <h1 className="site-page-title" style={{ marginTop: 0 }}>
          Kimence Beauty
        </h1>
        <p className="site-page-subtitle" style={{ marginBottom: 24 }}>
            Supabase isn&apos;t configured yet. Add env vars, then start the dev
            server.
        </p>

        <div className="site-service-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <p>1) Create a Supabase project</p>
          <p>
            2) Copy <span className="font-mono">.env.example</span> →
            <span className="font-mono"> .env.local</span> and fill in:
          </p>
          <ul className="list-disc pl-5 opacity-80">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/login" style={{ color: "#b63a60", fontWeight: 600 }}>
            → Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section
        className="site-hero"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
          position: "relative",
        }}
      >
        <div className="site-hero-inner">
          <h2>Luxury Nails &amp; Lashes</h2>
          <p>Premium beauty experience – tailored, elegant, unforgettable.</p>
          <Link href="/booking" className="btn">
            Book your session
          </Link>
        </div>
      </section>

      <div className="site-container">
        <h2 className="site-page-title">Welcome to Kimence Beauty</h2>
        <p
          style={{
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto 40px",
            fontSize: "1.2rem",
          }}
        >
          We combine artistry and relaxation. Explore our work or pick a service
          below.
        </p>

        <div
          className="site-services-grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            marginBottom: 30,
          }}
        >
          <Card title="✨ Lashes" description="Volume, hybrid, classic" price="MWK 55+" />
          <Card title="💅 Nails" description="Manicure, gel, art" price="MWK 45+" />
          <Card title="🎀 Makeup" description="Bridal, evening, natural" price="MWK 70+" />
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/services" style={{ color: "#b63a60", fontWeight: 600 }}>
            → view full services
          </Link>
        </div>
      </div>

      <div className="site-teaser">
        <div className="site-container">
          <h2 className="site-page-title" style={{ marginTop: 0 }}>
            Recent work
          </h2>
          <div className="site-teaser-grid">
            <img
              src="https://images.unsplash.com/photo-1611861914530-3a3f6e2c110d?auto=format&fit=crop&w=600&q=80"
              alt="nail art"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1611925730323-df83ee0570e0?auto=format&fit=crop&w=600&q=80"
              alt="lashes"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=600&q=80"
              alt="makeup"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1612011041377-65b0c18784b5?auto=format&fit=crop&w=600&q=80"
              alt="pedicure"
              loading="lazy"
            />
          </div>
          <div style={{ textAlign: "center", marginTop: 25 }}>
            <Link href="/portfolio" className="site-teaser-cta">
              see full portfolio →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
