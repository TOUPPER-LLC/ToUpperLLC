import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/apps', label: 'Apps' },
  { to: '/websites', label: 'Websites' },
  { to: '/contact', label: 'Contact us' },
  { to: '/privacy', label: 'Privacy' },
] as const;

export default function Nav() {
  const { pathname } = useLocation();
  // The menu is open only on the page where it was opened, so navigating closes it
  // without needing an effect to reset state.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isOpen = openOn === pathname;

  return (
    <nav className="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setOpenOn(isOpen ? null : pathname)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="main-nav" className={`navbar-collapse collapse d-sm-inline-flex flex-sm-row-reverse${isOpen ? ' show' : ''}`}>
          <ul className="navbar-nav flex-grow-1">
            {LINKS.map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink to={to} end className="nav-link text-dark" onClick={() => setOpenOn(null)}>
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
