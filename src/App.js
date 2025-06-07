// src/App.js - MODIFICADO CON PAYPAL

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import { AuthProvider } from './AuthContext';
import Header from './components/Header';
import './App.css';

// 1. Importa el proveedor de PayPal
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// 2. Define las opciones iniciales para el SDK de PayPal
// ¡¡¡ RECUERDA CAMBIAR EL CLIENT_ID POR EL REAL DE SANDBOX !!!
const initialOptions = {
    "client-id": "AclKeFueUT6hu_vNmKjHR4MEfn7vyF3J3mzk8DxkkM0y_Gc9DyD2250fCktw_Tt8h3Qu8--U8EDWEc7u",
    currency: "USD",
    intent: "capture",
    debug: "true",
};

function App() {
    return (
        // 3. Envuelve la aplicación con el PayPalScriptProvider
        <PayPalScriptProvider options={initialOptions}>
            <BrowserRouter>
                <AuthProvider>
                    <Header />
                    <div className="main-content">
                        <AppRouter />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </PayPalScriptProvider>
    );
}

export default App;
