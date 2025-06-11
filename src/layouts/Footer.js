// src/components/Layout/Footer.js
import React from 'react';
import './Footer.css'; // Crearemos este archivo CSS en el siguiente paso

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-main">
                <div className="footer-column">
                    <h4>Navegación</h4>
                    <ul>
                        <li><a href="/comprar-pasajes"><i className="fas fa-bus-alt"></i> Comprar pasajes</a></li>
                        <li><a href="/servicios"><i className="fas fa-list"></i> Servicios</a></li>
                        <li><a href="/agencias"><i className="fas fa-map-marker-alt"></i> Agencias</a></li>
                        <li><a href="tel:1717"><i className="fas fa-phone"></i> 1717</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Información</h4>
                    <ul>
                        <li><a href="/destinos"><i className="fas fa-route"></i> Destinos</a></li>
                        <li><a href="/trabaja-con-nosotros"><i className="fas fa-briefcase"></i> Trabajá con nosotros</a></li>
                        <li><a href="/contacto"><i className="fas fa-envelope"></i> Contacto</a></li>
                        <li><a href="/colaboradores"><i className="fas fa-users"></i> Colaboradores</a></li>
                        <li><a href="mailto:info@carpibus.com.uy"><i className="fas fa-at"></i> info@carpibus.com.uy</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>CarpiBus</h4>
                    <p>Tu viaje, nuestra pasión.</p>
                    <div className="payment-logos">
                        <i className="fab fa-cc-visa" title="Visa"></i>
                        <i className="fab fa-cc-mastercard" title="MasterCard"></i>
                        <i className="fab fa-cc-amex" title="American Express"></i>
                    </div>
                    <div className="social-icons">
                        <a href="#" aria-label="Nuestra ubicación"><i className="fas fa-map-marked-alt"></i></a>
                        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
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