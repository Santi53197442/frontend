// src/layouts/Footer.js
import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación interna
import './Footer.css'; // Asegúrate de que este archivo de estilos exista

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-main">
                <div className="footer-column">
                    <h4>Navegación</h4>
                    <ul>
                        {/* Usamos <Link> para rutas internas para no recargar la página */}
                        <li><Link to="/viajes"><i className="fas fa-bus-alt"></i> Comprar pasajes</Link></li>
                        <li><Link to="/servicios"><i className="fas fa-list"></i> Servicios</Link></li>
                        <li><Link to="/agencias"><i className="fas fa-map-marker-alt"></i> Agencias</Link></li>

                        {/* Para enlaces externos como 'tel:', seguimos usando la etiqueta <a> normal */}
                        <li><a href="tel:3232"><i className="fas fa-phone"></i> 3232</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Información</h4>
                    <ul>
                        {/* Reemplazamos todos los <a> internos por <Link> */}
                        <li><Link to="/destinos"><i className="fas fa-route"></i> Destinos</Link></li>
                        <li><Link to="/contacto"><i className="fas fa-envelope"></i> Contacto</Link></li>

                        {/* 'mailto:' es un enlace externo, así que mantenemos <a> */}
                        <li><a href="mailto:info@carpibus.com.uy"><i className="fas fa-at"></i> info@carpibus.com.uy</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>CarpiBus</h4>
                    <p>Tu viaje, nuestra pasión.</p>
                    <div className="payment-logos">
                        {/* Estos íconos representan métodos de pago, no son enlaces */}
                        <i className="fab fa-cc-visa" title="Visa"></i>
                        <i className="fab fa-cc-mastercard" title="MasterCard"></i>
                        <i className="fab fa-cc-amex" title="American Express"></i>
                    </div>
                    <div className="social-icons">

                        {/* --- ESTA ES LA LÍNEA MODIFICADA --- */}
                        <a href="https://maps.app.goo.gl/ptJgk7WsJu5k4c8D7" target="_blank" rel="noopener noreferrer" aria-label="Nuestra ubicación"><i className="fas fa-map-marked-alt"></i></a>

                        {/* El resto de los enlaces sociales */}
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>Copyright © {new Date().getFullYear()} CarpiBus | Todos los derechos reservados.</p>
                <p className="powered-by">Powered by YourName</p>
            </div>
        </footer>
    );
};

export default Footer;