import { Link } from 'react-router';
import logo from '../assets/img/Original.png';
import { SERVICES } from '../content/services';

export default function Home() {
  return (
    <>
      <title>ToUpper LLC | Custom software, cloud, data and AI</title>
      <section className="hero">
        <img src={logo} className="hero-logo" alt="logo" />
        <h1 className="hero-title">
          <span>We build the software.</span> <span>You grow the business.</span>
        </h1>
        <p className="hero-lede">
          Websites, apps, cloud systems and automation that takes busywork off your plate. One experienced team
          plans it, builds it and keeps it running.
        </p>
        <div className="hero-actions">
          <Link to="/contact" className="btn btn-primary btn-lg">
            Get a free consultation
          </Link>
          <Link to="/services" className="btn btn-outline-secondary btn-lg">
            See what we do
          </Link>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <h2>What we do</h2>
          <ul className="service-list">
            {SERVICES.map((service) => (
              <li key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
