import { LOCATION_LINE } from '../content/seo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>&copy; {new Date().getFullYear()} ToUpper LLC</span>
        <span className="footer-sep"> &middot; </span>
        <span className="footer-location">{LOCATION_LINE}</span>
      </div>
    </footer>
  );
}
