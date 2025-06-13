// src/main.jsx - SOLUCIÓN CORRECTA
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        {/* SOLUCIÓN: BrowserRouter es el proveedor principal que envuelve a todo. */}
        <BrowserRouter>
            {/* Ahora, AuthProvider está DENTRO del contexto del Router. */}
            {/* Cuando se cargue y llame a useNavigate, funcionará. */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);