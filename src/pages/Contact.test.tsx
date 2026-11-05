import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from './Contact';
import { MIN_FILL_MS } from '../../shared/contact';
import Sent from './Sent';

const URL = 'https://contact.example.com/';
const fetchMock = vi.fn<typeof fetch>();

function renderContact() {
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/sent" element={<Sent />} />
      </Routes>
    </MemoryRouter>,
  );
}

function setupUser() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

/** Fills the form the way a person would, taking `seconds` of (fake) time. */
async function fillForm(user: ReturnType<typeof userEvent.setup>, seconds = 10) {
  await user.type(screen.getByLabelText('First Name'), '  Jane ');
  await user.type(screen.getByLabelText('Last Name'), 'Doe');
  await user.type(screen.getByLabelText('Email'), 'jane@doe.com');
  await user.type(screen.getByLabelText('Message'), 'Hello!');
  vi.advanceTimersByTime(seconds * 1000);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubEnv('VITE_CONTACT_URL', URL);
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('Contact', () => {
  it('shows field errors and does not submit when empty', async () => {
    const user = setupUser();
    const { container } = renderContact();

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(container.querySelectorAll('.invalid-feedback')).toHaveLength(4);
    expect(screen.getByLabelText('Email')).toHaveClass('is-invalid');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits trimmed payload and navigates to /sent', async () => {
    const user = setupUser();
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    renderContact();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('heading', { name: 'Thank you for contacting us' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(URL);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'content-type': 'application/json' });
    const { elapsedMs, ...payload } = JSON.parse(init?.body as string);
    expect(payload).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
      message: 'Hello!',
      company: '',
    });
    expect(elapsedMs).toBeGreaterThanOrEqual(10_000);
  });

  it('waits out the minimum fill time before sending a very fast submission', async () => {
    const user = setupUser();
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    renderContact();

    await fillForm(user, 0);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();

    await vi.advanceTimersByTimeAsync(MIN_FILL_MS);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string).elapsedMs).toBeGreaterThanOrEqual(MIN_FILL_MS);
  });

  it('disables submit while sending', async () => {
    const user = setupUser();
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderContact();

    await fillForm(user);
    const button = screen.getByRole('button', { name: 'Send' });
    await user.click(button);
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Sending…');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows error on network failure', async () => {
    const user = setupUser();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    renderContact();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/try again/);
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    expect(screen.queryByText('Thank you for contacting us')).not.toBeInTheDocument();
  });

  it('shows error on non-JSON 502', async () => {
    const user = setupUser();
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));
    renderContact();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/try again/);
  });

  it('shows error when no endpoint configured', async () => {
    const user = setupUser();
    vi.stubEnv('VITE_CONTACT_URL', '');
    renderContact();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('honeypot field is hidden from users', () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="company"]')!;

    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('autocomplete', 'off');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
