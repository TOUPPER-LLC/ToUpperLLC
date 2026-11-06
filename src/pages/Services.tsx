import ConsultationCta from '../components/ConsultationCta';
import { SERVICES } from '../content/services';
import Seo from '../components/Seo';

const STEPS = [
  { title: 'Free consultation', text: 'We learn about your business, your goals and what is getting in the way.' },
  { title: 'Plan and estimate', text: 'You get a clear scope, timeline and price, planned around your launch date.' },
  { title: 'Build and test', text: 'We build in short cycles, show progress often and test thoroughly before release.' },
  { title: 'Launch and support', text: 'We handle deployment, then stay on for maintenance, patching and support.' },
];

export default function Services() {
  return (
    <>
      <Seo page="services" />
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Services</h1>
          <p className="page-lede">
            One team for the whole lifecycle of your software: planning, building, hosting and keeping it running.
            Whether you are a small business launching your first site or an established organization modernizing
            critical systems, we scale to fit.
          </p>
        </header>

        <ul className="service-list">
          {SERVICES.map((service) => (
            <li key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.detail}</p>
            </li>
          ))}
        </ul>

        <section className="section">
          <h2>How we work</h2>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="band">
        <ConsultationCta />
      </div>
    </>
  );
}
