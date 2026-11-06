import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  it('renders the home logo', () => {
    renderAt('/');
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  it('renders the about page about the company', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1, name: 'About ToUpper' })).toBeInTheDocument();
  });

  it('redirects the retired /apps page to home', () => {
    renderAt('/apps');
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  it('redirects /websites to Our Work', () => {
    renderAt('/websites');
    expect(screen.getByRole('heading', { level: 1, name: 'Our work' })).toBeInTheDocument();
  });

  it('home leads visitors to a consultation', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Get a free consultation' })).toHaveAttribute('href', '/contact');
  });

  it('renders the services page including AI tooling', () => {
    renderAt('/services');
    expect(screen.getByRole('heading', { level: 1, name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /AI/ })).toBeInTheDocument();
  });

  it('nav lists the site sections in order', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'Home',
      'About',
      'Services',
      'Our work',
      'Contact us',
      'Privacy',
    ]);
  });

  it('renders the Our Work card with an external link', () => {
    renderAt('/work');
    expect(screen.getByText('Say No To Bugs')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open' })[2]).toHaveAttribute('href', 'http://saynotobugsflorida.com/');
  });

  it('lists every project on Our work with a link to the live site', () => {
    renderAt('/work');
    const links = screen.getAllByRole('link', { name: 'Open' }).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://aboveparcapital.com/', 'https://yieldbadger.com/', 'http://saynotobugsflorida.com/']);
  });

  it('about page explains automation and AI in plain sections', () => {
    renderAt('/about');
    for (const name of ['What we do', 'Automation', 'AI, used carefully', 'Experience', 'Working with us']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('renders the privacy policy', () => {
    renderAt('/privacy');
    expect(screen.getByText(/understand the importance of privacy/)).toBeInTheDocument();
  });

  it('renders the sent confirmation', () => {
    renderAt('/sent');
    expect(screen.getByRole('heading', { name: 'Thank you for contacting us' })).toBeInTheDocument();
  });

  it('renders a not found page for unknown routes', () => {
    renderAt('/nope');
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it.each(['/', '/about', '/contact', '/nope'])('shows the current year in the footer on %s', (path) => {
    renderAt(path);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} ToUpper LLC`);
    expect(footer).toHaveTextContent('Based in Tampa, Florida, working with clients across the U.S.');
  });

  it.each(['/', '/about'])('says where the company is based on %s', (path) => {
    renderAt(path);
    const main = screen.getByRole('main');
    expect(within(main).getByText(/Based in Tampa, Florida, working with clients across the U\.S\./i)).toBeInTheDocument();
  });
});
