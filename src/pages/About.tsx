import codeImage from '../assets/img/code2.jpg';
import ConsultationCta from '../components/ConsultationCta';

export default function About() {
  return (
    <>
      <title>About | ToUpper LLC</title>
      <div className="container about">
        <div className="about-copy">
          <h1 className="page-title">About ToUpper</h1>
          <p className="page-lede ms-0">
            We&apos;re a small software company that builds websites, apps and the systems behind them, then stays
            around to keep them running. We&apos;ve been doing it since 2019.
          </p>

          <h2>What we do</h2>
          <p>
            Some clients come to us for a new website. Others need an internal tool, a better way to handle their data,
            or help moving off an old system that has become slow or expensive. Whatever the size, we can handle the
            whole job: planning, building, hosting and maintenance.
          </p>

          <h2>Automation</h2>
          <p>
            A lot of our work is automation: finding the tasks someone does by hand every week and having software do
            them instead. A few examples from projects our team has worked on:
          </p>
          <ul>
            <li>Invoices for thousands of customers, created and emailed automatically every two weeks.</li>
            <li>Security reports that used to take about three days to write, now produced in seconds.</li>
            <li>Daily data imports and reports that run on their own and only alert someone when something is off.</li>
          </ul>
          <p>The result is fewer mistakes, faster turnaround, and people freed up for work that needs a person.</p>

          <h2>AI, used carefully</h2>
          <p>
            We use AI where it clearly helps, like answering questions from your own documents, drafting routine
            paperwork or sorting incoming requests. When privacy matters, we can run the models inside your own cloud
            account so your data stays with you. And if a simple script would do the job better, we&apos;ll tell you.
          </p>

          <h2>Experience</h2>
          <p>
            Our engineers have spent more than eight years building software for a major cloud provider, a lending
            company and a cybersecurity firm. That work includes moving terabytes of data between databases, building a
            data warehouse from scratch, and maintaining systems used by millions of people. We bring the same habits to
            every project, large or small: code review, automated tests, infrastructure defined in code, and monitoring
            once it&apos;s live.
          </p>

          <h2>Working with us</h2>
          <p>
            You talk directly to the engineers doing the work. We agree on a clear plan and price up front, show you
            progress as we go, and explain our decisions in plain language. We work in English and Spanish.
          </p>
        </div>
        <figure className="about-figure">
          <img src={codeImage} alt="Developer writing code at a laptop and monitors" width={988} height={1480} />
        </figure>
      </div>
      <div className="band">
        <ConsultationCta title="Let the geeks help" />
      </div>
    </>
  );
}
