import { Link } from 'react-router';
import logo from '../assets/img/Original.png';
import { SERVICES } from '../content/services';

export default function Home() {
  return (
    <>
      <title>ToUpper LLC | Custom software, cloud, data and AI</title>
      <section className="hero">
        <img src={logo} className="hero-logo" alt="logo" />
        <h1 className="hero-title">Software that moves your business up</h1>
        <p className="hero-lede">
          ToUpper designs, builds and runs web applications, cloud infrastructure, data pipelines and AI tools for
          businesses of every size.
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
