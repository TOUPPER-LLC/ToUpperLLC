import krazyBall from '../assets/img/football.png';
import ProjectCard from '../components/ProjectCard';

export default function Apps() {
  return (
    <ProjectCard
      title="Krazy Ball"
      image={krazyBall}
      href="https://play.google.com/store/apps/details?id=com.ToUpperLLC.BallKrazy&hl=en_US"
      colClass="col-sm-3"
    />
  );
}
