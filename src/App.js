// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router'; // Asumiendo que tu router.js exporta AppRouter
import { AuthProvider } from './AuthContext';
import './App.css'; // Tus estilos globales

function App() {
    return (
        <BrowserRouter>
            <AuthProvider> {/* AuthProvider envuelve tus rutas */}
                <AppRouter />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;