import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Assemblies from './pages/Assemblies'
import Programmes from './pages/Programmes'
import VideoGallery from './pages/VideoGallery'
import Contact from './pages/Contact'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="assemblies" element={<Assemblies />} />
          <Route path="programmes" element={<Programmes />} />
          <Route path="video-gallery" element={<VideoGallery />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
