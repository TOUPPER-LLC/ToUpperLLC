import { LOCATION_LINE } from '../content/seo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        &copy; {new Date().getFullYear()} ToUpper LLC &middot; <span className="d-inline-block">{LOCATION_LINE}</span>
      </div>
    </footer>
  );
}
