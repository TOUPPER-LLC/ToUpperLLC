import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';

function renderApp() {
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
  const collapse = () => container.querySelector('.navbar-collapse')!;
  return { collapse };
}

describe('Nav', () => {
  it('toggler opens and closes the menu', async () => {
    const user = userEvent.setup();
    const { collapse } = renderApp();
    const toggler = screen.getByRole('button', { name: 'Toggle navigation' });

    expect(collapse()).not.toHaveClass('show');
    expect(toggler).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggler);
    expect(collapse()).toHaveClass('show');
    expect(toggler).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggler);
    expect(collapse()).not.toHaveClass('show');
  });

  it('menu closes after navigating', async () => {
    const user = userEvent.setup();
    const { collapse } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    await user.click(screen.getByRole('link', { name: 'About' }));

    expect(collapse()).not.toHaveClass('show');
    expect(screen.getByText(/Since 2019, we have been providing/)).toBeInTheDocument();
  });

  it('menu closes when tapping the current page link', async () => {
    const user = userEvent.setup();
    const { collapse } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Toggle navigation' }));
    await user.click(screen.getByRole('link', { name: 'Home' }));

    expect(collapse()).not.toHaveClass('show');
  });
});
