// src/App.js
// --- VERSIÓN CORREGIDA Y FUNCIONAL ---
import React from 'react';
// import { BrowserRouter } from 'react-router-dom'; // <--- HEMOS QUITADO ESTA LÍNEA
import { AuthProvider } from './AuthContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import AppRouter from './router';
import Header from './components/Header';
import Footer from './layouts/Footer';

import './App.css';

const initialOptions = {
    "client-id": "AclKeFueUT6hu_vNmKjHR4MEfn7vyF3J3mzk8DxkkM0y_Gc9DyD2250fCktw_Tt8h3Qu8--U8EDWEc7u",
    currency: "USD",
    intent: "capture",
};

function App() {
    return (
        // El Proveedor de PayPal puede estar aquí
        <PayPalScriptProvider options={initialOptions}>

            {/* El BrowserRouter ya no está aquí. ¡Correcto! */}

            {/* AuthProvider ahora es el siguiente nivel */}
            <AuthProvider>
                <div className="App">
                    <Header />
                    <main className="main-content">
                        {/* El Router con las rutas se renderiza aquí dentro del contexto */}
                        <AppRouter />
                    </main>
                    <Footer />
                </div>
            </AuthProvider>

        </PayPalScriptProvider>
    );
}

export default App;