// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router'; // O como se llame tu archivo de rutas
import './App.css'; // o tus estilos globales

function App() {
    return (
        <BrowserRouter> {/* BrowserRouter aquí */}
            <AppRouter /> {/* AppRouter ya tiene AuthProvider */}
        </BrowserRouter>
    );
}

export default App;