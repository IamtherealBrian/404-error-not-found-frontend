import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';

import './App.css';

import Home from './Components/Home';
import Navbar from './Components/Navbar';
import People from './Components/People';
import Texts from './Components/Texts';

function PersonPage() {
  const { name } = useParams();
  return <h1>{name}</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* For a different home page, do:
         <Route index element={<Login />} /> */}
          <Route index element={<Home />} />
          <Route path="people" element={<People />} />
        <Route path="people/:name" element={<PersonPage />} />
        <Route path="/texts" element={<Texts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
