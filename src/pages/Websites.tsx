import sayNoToBugs from '../assets/img/SayNoToBug.jpg';
import ProjectCard from '../components/ProjectCard';

export default function Websites() {
  return (
    <ProjectCard title="Say No To Bugs" image={sayNoToBugs} href="http://saynotobugsflorida.com/" colClass="col-sm-4" />
  );
}
