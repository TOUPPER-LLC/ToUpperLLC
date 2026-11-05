type ProjectCardProps = {
  title: string;
  image: string;
  href: string;
  /** Bootstrap column class controlling the card width, e.g. `col-sm-3`. */
  colClass: string;
};

export default function ProjectCard({ title, image, href, colClass }: ProjectCardProps) {
  return (
    <div className="container">
      <div className="row">
        <div className={colClass}>
          <div className="card">
            <img className="card-img-top" width="100%" src={image} alt={title} />
            <div className="card-body">
              <p className="card-text">{title}</p>
              <div className="card-actions">
                <a className="btn btn-secondary" href={href} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
