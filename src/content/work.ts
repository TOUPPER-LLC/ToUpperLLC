import sayNoToBugs from '../assets/img/SayNoToBug.jpg';

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
    name: 'Say No To Bugs',
    description: 'Marketing website for a Florida pest control company.',
    url: 'http://saynotobugsflorida.com/',
    image: sayNoToBugs,
    imageAlt: 'Say No To Bugs website home page',
  },
];
