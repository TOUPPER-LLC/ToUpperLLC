import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Sent from './pages/Sent';
import Services from './pages/Services';
import Work from './pages/Work';

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="work" element={<Work />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="sent" element={<Sent />} />
          {/* Old URLs that may still be linked from elsewhere. */}
          <Route path="websites" element={<Navigate to="/work" replace />} />
          <Route path="apps" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}
