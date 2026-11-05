import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Our work' },
  { to: '/contact', label: 'Contact us' },
  { to: '/privacy', label: 'Privacy' },
] as const;

export default function Nav() {
  const { pathname } = useLocation();
  // The menu is open only on the page where it was opened, so navigating closes it
  // without needing an effect to reset state.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isOpen = openOn === pathname;
  const close = () => setOpenOn(null);

  return (
    <nav className="navbar navbar-expand-md bg-white border-bottom site-nav mb-3" aria-label="Main">
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
        <div id="main-nav" className={`collapse navbar-collapse${isOpen ? ' show' : ''}`}>
          <ul className="navbar-nav">
            {LINKS.map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink to={to} end className="nav-link" onClick={close}>
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
