import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Beepo AI Phone Agent!</h1>
      <p>This is the home page!</p>
      <Link to="/ai-demo">
        Try AI Demo
      </Link>
    </div>
  );
}
