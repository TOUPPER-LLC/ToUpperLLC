import { Link } from 'react-router';
import Seo from '../components/Seo';

const LAST_UPDATED = 'November 5, 2026';

export default function Privacy() {
  return (
    <div className="page prose">
      <Seo page="privacy" />
      <h1 className="page-title">Privacy policy</h1>
      <p className="text-body-secondary">Last updated: {LAST_UPDATED}</p>

      <h2>Who we are</h2>
      <p>
        ToUpper LLC is a software company based in Tampa, Florida. This policy explains what information we collect
        on our website, toupperllc.com, and what we do with it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>What you send us.</strong> When you use our <Link to="/contact">contact form</Link>, we receive
          your first and last name, your email address and your message.
        </li>
        <li>
          <strong>How the site is used.</strong> We use Google Analytics to collect anonymous usage data: which pages
          are visited, your approximate location (worked out from your IP address), your type of device and browser,
          and how you arrived at the site. Google Analytics uses cookies to do this.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use the details from the contact form only to reply to you and talk about your project. We use analytics
        data only to understand how the site is used and to improve it. We do not sell or rent personal information,
        and we do not use it for advertising.
      </p>

      <h2>Who handles it for us</h2>
      <ul>
        <li>
          <strong>Amazon Web Services</strong> hosts the website and delivers contact form messages to us by email.
        </li>
        <li>
          <strong>Google Workspace</strong> runs our email.
        </li>
        <li>
          <strong>Google Analytics</strong> collects and reports the usage data described above.
        </li>
      </ul>
      <p>Contact form messages are delivered to our inbox. We don&apos;t store them in a separate database.</p>

      <h2>How long we keep it</h2>
      <p>
        We keep contact form emails for as long as we need them for our conversation with you and for our business
        records. Analytics data is kept for the period set in our Google Analytics retention setting, after which
        Google deletes it.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          You can ask us to show you, correct or delete the information you sent us. Just send us a message through
          the <Link to="/contact">contact page</Link>.
        </li>
        <li>You can block or delete cookies in your browser settings.</li>
        <li>
          You can stop Google Analytics from collecting data about your visits with Google&apos;s{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            opt-out browser add-on
          </a>
          .
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        This site isn&apos;t directed at children under 13, and we don&apos;t knowingly collect information from
        them.
      </p>

      <h2>Security</h2>
      <p>
        Information you send through this site travels over an encrypted (HTTPS) connection, and we take reasonable
        steps to protect it. No method of sending or storing data is 100% secure, though, so we can&apos;t guarantee
        absolute security.
      </p>

      <h2>Changes to this policy</h2>
      <p>If we change this policy, we&apos;ll update this page and the &ldquo;Last updated&rdquo; date above.</p>

      <h2>Questions</h2>
      <p>
        If you have any questions about this policy or your information, please reach us through our{' '}
        <Link to="/contact">contact page</Link>.
      </p>
    </div>
  );
}
