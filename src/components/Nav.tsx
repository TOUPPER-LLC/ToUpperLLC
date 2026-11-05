import { NavLink } from 'react-router';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/apps', label: 'Apps' },
  { to: '/websites', label: 'Websites' },
  { to: '/contact', label: 'Contact us' },
  { to: '/privacy', label: 'Privacy' },
] as const;

export default function Nav() {
  return (
    <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="main-nav" className="navbar-collapse collapse d-sm-inline-flex flex-sm-row-reverse">
          <ul className="navbar-nav flex-grow-1">
            {LINKS.map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink to={to} end className="nav-link text-dark">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
