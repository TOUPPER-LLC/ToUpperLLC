export type Service = {
  title: string;
  /** One line for the home page. */
  summary: string;
  /** A short paragraph for the Services page. */
  detail: string;
};

export const SERVICES: readonly Service[] = [
  {
    title: 'Web and mobile applications',
    summary: 'Websites, customer portals and internal tools, built to last.',
    detail:
      'Customer-facing websites, portals and internal tools, from a single landing page to a full-stack platform. We build with React, Next.js, Django, FastAPI and Node.js, and make everything accessible and fast on any device.',
  },
  {
    title: 'Cloud and DevOps',
    summary: 'Reliable hosting on AWS, Google Cloud, Azure or Oracle Cloud with automated releases.',
    detail:
      'Infrastructure on AWS, Google Cloud (GCP), Azure and Oracle Cloud defined as code with Terraform, packaged with Docker and Kubernetes, and shipped through CI/CD pipelines so releases are routine instead of risky.',
  },
  {
    title: 'Data engineering and reporting',
    summary: 'Pipelines and dashboards that turn scattered records into decisions.',
    detail:
      'ETL pipelines, data warehouses and reports that pull your records together and keep them current, so leadership can see what is working and where to invest.',
  },
  {
    title: 'AI tooling and automation',
    summary: 'Practical AI and automation that take repetitive work off your plate.',
    detail:
      'Assistants that answer questions from your own documents, automatic report and invoice generation, and workflow automation. We work with leading models like Claude as well as open models hosted privately in your own cloud, so your data stays yours.',
  },
  {
    title: 'Modernization and migration',
    summary: 'Upgrade aging systems and cut cloud costs without downtime.',
    detail:
      'Upgrade outdated code and dependencies, move off expensive platforms and consolidate databases, planned carefully so your customers never notice the switch.',
  },
  {
    title: 'Support and maintenance',
    summary: 'Monitoring, patching and on-call help after launch.',
    detail:
      'Monitoring, monthly security patching, automated tests and on-call support, so your systems stay fast and secure long after launch day.',
  },
];
