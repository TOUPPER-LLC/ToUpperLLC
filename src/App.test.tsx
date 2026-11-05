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

  it('renders the about copy', () => {
    renderAt('/about');
    expect(screen.getByText(/Since 2019, we have been providing/)).toBeInTheDocument();
  });

  it('renders the apps card with an external link', () => {
    renderAt('/apps');
    expect(screen.getByText('Krazy Ball')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Open' });
    expect(link).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=com.ToUpperLLC.BallKrazy&hl=en_US');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the websites card with an external link', () => {
    renderAt('/websites');
    expect(screen.getByText('Say No To Bugs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', 'http://saynotobugsflorida.com/');
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
    expect(within(footer).getByText(`© ${new Date().getFullYear()}`)).toBeInTheDocument();
  });
});
