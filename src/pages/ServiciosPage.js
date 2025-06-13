// src/pages/ServiciosPage.jsx
import React from 'react';
import './ServiciosPage.css'; // Crearemos este archivo a continuación

const ServiciosPage = () => {
    return (
        <div className="servicios-container">
            {/* Columna Izquierda: Navegación */}
            <aside className="servicios-sidebar">
                <ul>
                    <li><a href="#venta-pasajes">Venta de pasajes »</a></li>
                    <li><a href="#encomiendas">Cartas y Encomiendas »</a></li>
                    <li><a href="#reembolsos">Contra reembolsos »</a></li>
                    <li><a href="#giros">Giros al instante »</a></li>
                    <li><a href="#estudiantes">Estudiantes »</a></li>
                    <li><a href="#compra-agencias">Compra de pasajes »</a></li>
                </ul>
            </aside>

            {/* Columna Derecha: Contenido Principal */}
            <main className="servicios-content">
                <h1><i className="fas fa-list-alt"></i> Servicios</h1>

                <section id="venta-pasajes">
                    <h2><i className="fas fa-check-circle"></i> Venta de pasajes</h2>
                    <p>Compre su pasaje en nuestro sitio web y suba directamente al coche sin pasar por mostrador. Ahorre tiempo y molestias.</p>
                </section>

                <section id="encomiendas">
                    <h2><i className="fas fa-box-open"></i> Cartas y Encomiendas</h2>
                    <p>Llevamos cartas y encomiendas a todo el país. Puede solicitar el retiro en su domicilio al <a href="tel:1717">1717</a> o vía e-mail a <a href="mailto:envios@dac.com.uy">envios@dac.com.uy</a>. También puede visitar DAC dónde encontrará tarifas de nuestros productos.</p>
                </section>

                <section id="reembolsos">
                    <h2><i className="fas fa-hand-holding-usd"></i> Contra reembolsos</h2>
                    <p>(Cash on Delivery). Envíe su mercadería y la misma le será cobrada al destinatario en el momento de la entrega. Para más información haga click aquí o llame al <a href="tel:1717">1717</a>. También puede despachar modalidad de contrarreembolsos en todas nuestras sucursales.</p>
                </section>

                <section id="giros">
                    <h2><i className="fas fa-running"></i> Giros al instante</h2>
                    <p>Realizamos giros instantáneos a todo el país con la comisión más baja en plaza. Para más información haga click aquí o llame al <a href="tel:1717">1717</a>.</p>
                </section>

                <section id="estudiantes">
                    <h2><i className="fas fa-user-graduate"></i> Estudiantes</h2>
                    <p>Para solicitar descuento de estudiante enviar constancia de estudio y foto carné a <a href="mailto:estudiantes@agenciacentral.com.uy">estudiantes@agenciacentral.com.uy</a>, cuando sus datos sean validados quedará habilitado el descuento al comprar con su documento en la web.</p>
                </section>

                <section id="compra-agencias">
                    <h2><i className="fas fa-check-circle"></i> Compra de pasajes</h2>
                    <p>También tiene la posibilidad de adquirir sus pasajes en las <a href="/agencias">agencias DAC</a> de todo el país.</p>
                </section>

            </main>
        </div>
    );
};

export default ServiciosPage;