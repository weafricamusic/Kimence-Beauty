const services = [
  { name: "Lashes", description: "Classic / Volume / Hybrid", price: "MWK 55" },
  { name: "Manicure", description: "Gel, art, paraffin", price: "MWK 45" },
  { name: "Pedicure", description: "Spa & gel", price: "MWK 55" },
  { name: "Makeup", description: "Bridal / Evening", price: "MWK 70" },
  { name: "Brows", description: "Lamination & wax", price: "MWK 35" },
  { name: "Combo", description: "Lashes + manicure", price: "MWK 90" },
];

export default function ServicesPage() {
  return (
    <div className="site-container">
      <h1 className="site-page-title">Pamper yourself</h1>
      <p className="site-page-subtitle">Pick a service, then book a time.</p>

      <div className="site-services-grid">
        {services.map((s) => (
          <div key={s.name} className="site-service-card">
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <div className="price">{s.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
