// src/layouts/VendedorLayout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
// import Header from '../components/Header'; // O un header específico para vendedor
// import Footer from '../components/Footer'; // O un footer específico para vendedor
//import './VendedorLayout.css'; // Si tienes estilos específicos

const VendedorLayout = () => {
    return (
        <div className="vendedor-layout">
            {/* <Header /> // Puedes reusar tu Header.js y mostrar enlaces condicionales */}
            <nav className="vendedor-nav">
                {/* Ejemplo de navegación específica para vendedor */}
                <Link to="/vendedor/dashboard">Dashboard Vendedor</Link>
                <Link to="/vendedor/alta-localidad">Alta de Localidad</Link>
                {/* <Link to="/vendedor/mis-localidades">Mis Localidades</Link> */}
            </nav>
            <main className="vendedor-content">
                <Outlet /> {/* Aquí se renderizarán las páginas hijas (Dashboard, AltaLocalidad, etc.) */}
            </main>
            {/* <Footer /> */}
        </div>
    );
};

export default VendedorLayout;