import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import About from './pages/About';
import Apps from './pages/Apps';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Sent from './pages/Sent';
import Websites from './pages/Websites';

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="apps" element={<Apps />} />
          <Route path="websites" element={<Websites />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="sent" element={<Sent />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}
