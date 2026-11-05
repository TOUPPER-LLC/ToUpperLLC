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
            ToUpper LLC is a software consultancy that helps organizations plan, build and run the software they depend
            on.
          </p>
          <p>
            Since 2019 we have built customer-facing websites, internal tools, cloud infrastructure and the data
            pipelines behind them. Our engineers bring more than eight years of experience from enterprise cloud,
            financial services and cybersecurity, where the stakes are high and downtime is not an option.
          </p>
          <p>
            That experience shows up in the results. Our team has led data migrations measured in terabytes that cut
            infrastructure spending by tens of millions of dollars a year, built a company data warehouse from zero to
            more than a million records, automated invoicing for thousands of customers so a manual billing process
            disappeared, and turned three-day reporting work into a task that takes seconds.
          </p>
          <p>
            We bring the same discipline to every project, large or small. We plan around your launch date, test
            thoroughly, follow security best practices and stay on after launch for maintenance, patching and cloud
            support. Our team holds Oracle Cloud Foundations and Oracle Cloud AI certifications and works in both
            English and Spanish.
          </p>
          <p>
            We also help teams put AI to work responsibly: assistants grounded in your own documents, automatic
            generation of reports and invoices, and language models hosted privately in your own cloud.
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
