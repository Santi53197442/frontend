// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import { AuthProvider } from './AuthContext';
import Header from './components/Header'; // Importa el nuevo Header
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Header /> {/* Añade el Header aquí, fuera del AppRouter si quieres que esté en todas partes */}
                <div className="main-content"> {/* Un div para el contenido principal podría ser útil para el layout */}
                    <AppRouter />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;