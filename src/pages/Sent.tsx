import { Link } from 'react-router';

export default function Sent() {
  return (
    <div className="page">
      <title>Message sent | ToUpper LLC</title>
      <h1 className="page-title mt-5">Thank you for contacting us</h1>
      <p className="page-lede">We will reach out to you as soon as possible!</p>
      <Link to="/" className="btn btn-outline-secondary">
        Back to home
      </Link>
    </div>
  );
}
