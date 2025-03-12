import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Home from './components/Home';
import FileScanner from './components/FileScanner';
import UrlScanner from './components/UrlScanner';
import PortScanner from './components/PortScanner';
import Reports from './components/Reports';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="container my-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-scan" element={<FileScanner />} />
            <Route path="/url-scan" element={<UrlScanner />} />
            <Route path="/port-scan" element={<PortScanner />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
