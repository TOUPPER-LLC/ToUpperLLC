import { Link } from 'react-router';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <div className="page">
      <Seo page="notFound" />
      <h1 className="page-title mt-5">Page not found</h1>
      <p className="page-lede">The page you are looking for has moved or no longer exists.</p>
      <Link to="/" className="btn btn-outline-secondary">
        Back to home
      </Link>
    </div>
  );
}
