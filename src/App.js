// src/App.js
// --- VERSIÓN ORIGINAL (La que causaba la redirección al recargar) ---

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import AppRouter from './router'; // Tu archivo con todas las rutas
import Header from './components/Header'; // O Navbar, según lo llames
import Footer from './layouts/Footer'; // Tu nuevo footer

import './App.css';

// Opciones iniciales para el SDK de PayPal con tu Client ID de Sandbox
const initialOptions = {
    "client-id": "AclKeFueUT6hu_vNmKjHR4MEfn7vyF3J3mzk8DxkkM0y_Gc9DyD2250fCktw_Tt8h3Qu8--U8EDWEc7u",
    currency: "USD",
    intent: "capture",
};

function App() {
    return (
        // 1. Proveedor de PayPal
        <PayPalScriptProvider options={initialOptions}>
            
            {/* 2. Proveedor de Rutas (BrowserRouter) envolviendo a AuthProvider */}
            <BrowserRouter>
            
                {/* 3. Proveedor de Autenticación */}
                <AuthProvider>

                    {/* 4. Estructura visual de la página */}
                    <div className="App">
                        <Header />

                        <main className="main-content">
                            {/* AppRouter renderizará el componente de la página actual aquí */}
                            <AppRouter />
                        </main>

                        <Footer />
                    </div>

                </AuthProvider>
            </BrowserRouter>
        </PayPalScriptProvider>
    );
}

export default App;