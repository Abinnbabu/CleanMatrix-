import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import UHome from './components/uhome';
import About from './components/about';
import './App.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UHome />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/About" element={<About />} />
      </Routes>
    </Router>
  );
}
export default App;
