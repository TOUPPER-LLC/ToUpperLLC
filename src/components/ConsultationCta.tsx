import { Link } from 'react-router';

/** Closing call to action shared by the content pages. */
export default function ConsultationCta({ title = 'Have a project in mind?' }: { title?: string }) {
  return (
    <section className="cta">
      <h2>{title}</h2>
      <p>Tell us what you need. Your first consultation is free.</p>
      <Link to="/contact" className="btn btn-primary btn-lg">
        Get a free consultation
      </Link>
    </section>
  );
}
