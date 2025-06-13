// src/pages/ServiciosPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación interna
import './ServiciosPage.css';

const ServiciosPage = () => {
    return (
        <div className="servicios-container">
            {/* Columna Izquierda: Navegación */}
            <aside className="servicios-sidebar">
                <ul>
                    {/* Los enlaces ahora apuntan a los IDs de las secciones */}
                    <li><a href="#venta-pasajes">Venta de pasajes »</a></li>
                    <li><a href="#reembolsos">Devolución de pasajes »</a></li>
                    <li><a href="#estudiantes">Estudiantes »</a></li>
                    <li><a href="#compra-agencias">Compra en agencias »</a></li>
                </ul>
            </aside>

            {/* Columna Derecha: Contenido Principal */}
            <main className="servicios-content">
                <h1><i className="fas fa-list-alt"></i> Servicios</h1>

                <section id="venta-pasajes">
                    <h2><i className="fas fa-check-circle"></i> Venta de pasajes</h2>
                    <p>Compre su pasaje en nuestro sitio web y suba directamente al coche sin pasar por mostrador. Ahorre tiempo y molestias.</p>
                </section>

                {/* --- SECCIÓN AÑADIDA Y ACTUALIZADA --- */}
                <section id="reembolsos">
                    <h2><i className="fas fa-undo-alt"></i> Devolución de pasajes (Reembolso)</h2>
                    <p>
                        Entendemos que los planes pueden cambiar. Ofrecemos la posibilidad de solicitar la devolución de su pasaje bajo las siguientes condiciones:
                    </p>
                    <ul>
                        <li>La solicitud de devolución debe realizarse con un mínimo de <strong>24 horas de antelación</strong> a la fecha y hora de salida del viaje.</li>
                        <li>Las devoluciones están sujetas a una <strong>penalización del 10%</strong> sobre el valor total del pasaje, que se descontará del monto a reembolsar.</li>
                        <li>Para iniciar el proceso, por favor diríjase a una de nuestras agencias con su pasaje y documento de identidad.</li>
                    </ul>
                    <p>
                        Las solicitudes que no cumplan con el plazo de 24 horas no serán elegibles para un reembolso.
                    </p>
                </section>
                {/* --- FIN DE LA SECCIÓN --- */}

                <section id="estudiantes">
                    <h2><i className="fas fa-user-graduate"></i> Estudiantes</h2>
                    <p>Para solicitar el descuento de estudiante, envíe su constancia de estudio y foto de carné a <a href="mailto:ccarpibus@gmail.com">ccarpibus@gmail.com</a>. Una vez que sus datos sean validados, el descuento quedará habilitado para sus futuras compras en la web utilizando su documento de identidad.</p>
                </section>

                <section id="compra-agencias">
                    <h2><i className="fas fa-building"></i> Compra en Agencias</h2>
                    <p>También tiene la posibilidad de adquirir sus pasajes en cualquiera de nuestras <Link to="/agencias">agencias</Link> distribuidas en todo el país.</p>
                </section>

            </main>
        </div>
    );
};

export default ServiciosPage;