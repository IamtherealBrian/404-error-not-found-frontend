import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import Write from './Components/Write/Write';
import Texts from './Components/Texts';
import People from './Components/People/People';
import './App.css';
import LoginPage from './Components/Login/LoginPage';

function PersonPage() {
    const { name } = useParams();
    return <h1>{name}</h1>;
}

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/write" element={<Write />} />
                <Route path="/people/:name" element={<PersonPage />} />
                <Route path="/texts" element={<Texts />} />
                <Route path="/people" element={<People />} />
                <Route path="/login" element={<LoginPage />} />  {/* 添加登录页面路由 */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
