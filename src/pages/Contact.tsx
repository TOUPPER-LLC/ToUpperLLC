import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { normalizeContact, validateContact, type ContactErrors, type ContactField } from '../../shared/contact';
import { submitContact } from '../lib/contactClient';

type FormState = Record<ContactField | 'company', string>;

const EMPTY: FormState = { firstName: '', lastName: '', email: '', message: '', company: '' };

const FIELDS: readonly { name: ContactField; label: string; type: string; placeholder: string }[] = [
  { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'Jane' },
  { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'janedoe@gmail.com' },
];

export default function Contact() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [startedAt] = useState(() => Date.now());

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const input = normalizeContact(values);
    const fieldErrors = validateContact(input);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus('sending');
    try {
      await submitContact(input, startedAt);
      navigate('/sent');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  const fieldClass = (name: ContactField) => `form-control${errors[name] ? ' is-invalid' : ''}`;
  const feedback = (name: ContactField) =>
    errors[name] && (
      <div id={`${name}-error`} className="invalid-feedback">
        {errors[name]}
      </div>
    );
  const describedBy = (name: ContactField) => (errors[name] ? `${name}-error` : undefined);

  return (
    <div className="controls">
      <div className="row">
        <div className="col-md-6">
          <div className="form-group" />
        </div>
        <div className="container">
          <div className="center">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <div key={name} className="form-group">
                  <label htmlFor={name}>{label}</label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    className={fieldClass(name)}
                    placeholder={placeholder}
                    value={values[name]}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={describedBy(name)}
                    autoComplete={name === 'email' ? 'email' : name === 'firstName' ? 'given-name' : 'family-name'}
                  />
                  {feedback(name)}
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className={fieldClass('message')}
                  placeholder="Write something here..."
                  value={values.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describedBy('message')}
                />
                {feedback('message')}
              </div>

              {/* Honeypot: invisible to people and screen readers; bots tend to fill every field. */}
              <div aria-hidden="true" className="honeypot">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.company}
                  onChange={handleChange}
                />
              </div>

              {status === 'error' && (
                <div className="alert alert-danger" role="alert">
                  Sorry, your message couldn&apos;t be sent. Please try again later.
                </div>
              )}

              <button className="d-inline-block btn btn-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
