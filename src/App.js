// src/App.js

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
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
        // 1. Proveedor de PayPal (puede estar afuera si no depende de otros contextos)
        <PayPalScriptProvider options={initialOptions}>
            
            {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE! --- */}
            {/* 2. El AuthProvider debe envolver al Router. */}
            {/*    Así, primero se resuelve el estado 'loading' y 'isAuthenticated', */}
            {/*    y solo DESPUÉS se renderiza el BrowserRouter con las rutas. */}
            <AuthProvider>
            
                {/* 3. El Router ahora está dentro, por lo que hereda el contexto ya resuelto. */}
                <BrowserRouter>

                    <div className="App">
                        <Header />

                        <main className="main-content">
                            <AppRouter />
                        </main>

                        <Footer />
                    </div>

                </BrowserRouter>
            </AuthProvider>
        </PayPalScriptProvider>
    );
}

export default App;
