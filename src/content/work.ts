import aboveParCapital from '../assets/img/aboveparcapital.jpg';
import sayNoToBugs from '../assets/img/SayNoToBug.jpg';
import yieldBadger from '../assets/img/yieldbadger.jpg';

export type Project = {
  name: string;
  description: string;
  url: string;
  image: string;
  /** Alt text describing the screenshot. */
  imageAlt: string;
};

// To add a project: drop a screenshot (about 1600px wide) into src/assets/img/,
// import it above, and add an entry here.
export const PROJECTS: readonly Project[] = [
  {
    name: 'Above Par Capital',
    description:
      'Website for a family-owned private real estate lender, presenting its loan programs and taking deal submissions from investors and builders.',
    url: 'https://aboveparcapital.com/',
    image: aboveParCapital,
    imageAlt: 'Above Par Capital home page with a modern house at dusk',
  },
  {
    name: 'YieldBadger',
    description:
      'Free real estate investing calculators covering rentals, flips and loans, with local rent, tax and rate data built in.',
    url: 'https://yieldbadger.com/',
    image: yieldBadger,
    imageAlt: 'YieldBadger home page showing an example rental deal analysis',
  },
  {
    name: 'Say No To Bugs',
    description: 'Marketing website for a Florida pest control company.',
    url: 'http://saynotobugsflorida.com/',
    image: sayNoToBugs,
    imageAlt: 'Say No To Bugs website home page',
  },
];
