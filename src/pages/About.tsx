import { Fragment } from 'react';
import codeImage from '../assets/img/code2.jpg';

// Each inner array is one paragraph; each string is one line on desktop.
// Line breaks are intentional (they shape the text column next to the image)
// and are collapsed on small screens via CSS.
const PARAGRAPHS: readonly (readonly string[])[] = [
  [
    'Since 2019, we have been providing users and clients the best',
    'experience when it comes to our product suite. At ToUpper LLC,',
    'we pride and distinguish ourselves by using the most cutting',
    'edge technology and efficient techniques when developing',
    'applications. We strive to produce the most elegant and',
    'easy-to-use applications for our clients to enhance their',
    'business.',
  ],
  [
    'During our planning process, we strategize to map out',
    'a robust project timeline in order to make sure that your',
    'desired launch date is met. In order to ensure that your',
    'application(s) is customer ready, we profusely test our',
    'application(s) to ensure the highest level of security',
    'is applied, weddle out any bugs, and solve any issues',
    'that may arise during implementation. We also offer',
    'publishing services once your project is completed,',
    'as well as any maintenance that your application(s)',
    'may require. If you are interested in cloud services',
    'or cloud deployment, we will be happy to consult',
    'with you to determine the best possible outcome.',
  ],
  [
    "Let the geeks help! We know creating a website isn't easy,",
    'so let us do the hard work for you. Please contact us and',
    'provide any questions or comments you may have! We',
    'will be happy to provide a free first consultation.',
  ],
];

export default function About() {
  return (
    <div className="about">
      <figure className="about-figure">
        <img src={codeImage} alt="Developer writing code at a laptop and monitors" />
      </figure>
      <p className="App-style">
        {PARAGRAPHS.map((lines, p) => (
          <Fragment key={p}>
            {p > 0 && (
              <>
                <br />
                <br className="paragraph-break" />
              </>
            )}
            {lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}{' '}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
