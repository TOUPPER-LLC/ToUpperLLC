import ConsultationCta from '../components/ConsultationCta';
import { PROJECTS } from '../content/work';
import Seo from '../components/Seo';

export default function Work() {
  return (
    <>
      <Seo page="work" />
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Our work</h1>
          <p className="page-lede">A few of the websites and applications we have built.</p>
        </header>
        <div className="work-grid pb-5">
          {PROJECTS.map((project) => (
            <article key={project.name} className="card work-card h-100">
              <img className="card-img-top" src={project.image} alt={project.imageAlt} />
              <div className="card-body d-flex flex-column">
                <h2 className="card-title">{project.name}</h2>
                <p className="card-text text-body-secondary">{project.description}</p>
                <a
                  className="btn btn-outline-primary mt-auto align-self-start"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="band">
        <ConsultationCta />
      </div>
    </>
  );
}
