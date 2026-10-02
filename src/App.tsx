import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Product from './pages/Product';
import Book from './pages/Book';
import Admin from './pages/Admin';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Measurements from './pages/Measurements';
export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route index element={<Home />} /><Route path="collections" element={<Collections />} />
    <Route path="product/:id" element={<Product />} /><Route path="book" element={<Book />} /><Route path="appointment" element={<Book />} />
    <Route path="about" element={<About />} /><Route path="services" element={<Services />} /><Route path="gallery" element={<Gallery />} />
    <Route path="contact" element={<Contact />} /><Route path="measurements" element={<Measurements />} />
    <Route path="admin" element={<Admin />} /><Route path="*" element={<p className="p-10">Page not found.</p>} />
  </Route></Routes>);
}
