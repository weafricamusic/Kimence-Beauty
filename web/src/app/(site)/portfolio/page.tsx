const images = [
  {
    src: "https://images.unsplash.com/photo-1611861914530-3a3f6e2c110d?auto=format&fit=crop&w=800&q=80",
    alt: "nail art",
  },
  {
    src: "https://images.unsplash.com/photo-1611925730323-df83ee0570e0?auto=format&fit=crop&w=800&q=80",
    alt: "eyelash extension",
  },
  {
    src: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=800&q=80",
    alt: "makeup look",
  },
  {
    src: "https://images.unsplash.com/photo-1612011041377-65b0c18784b5?auto=format&fit=crop&w=800&q=80",
    alt: "pedicure",
  },
  {
    src: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80",
    alt: "soft glam",
  },
  {
    src: "https://images.unsplash.com/photo-1522337660859-02fbefca4707?auto=format&fit=crop&w=800&q=80",
    alt: "glitter nails",
  },
];

export default function PortfolioPage() {
  return (
    <div className="site-container">
      <h1 className="site-page-title">our beauty gallery</h1>
      <p className="site-page-subtitle">
        A curated set of nails, lashes, and glam looks.
      </p>

      <div className="site-portfolio-grid">
        {images.map((img) => (
          <div key={img.src} className="site-portfolio-card">
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
