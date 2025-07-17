import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Asumiendo que AuthContext está en esa ruta
import './VendedorDashboard.css'; // Asegúrate de que este archivo exista y tenga estilos para las tarjetas

const VendedorDashboard = () => {
    const { user } = useAuth();

    // Acciones disponibles para el Vendedor, combinando las originales y las del sidebar
    const vendedorActions = [
        {
            title: "Dashboard Principal",
            description: "Volver a la vista general del panel de vendedor.",
            link: "/vendedor/dashboard",
            color: "#54a0ff" // Un azul claro
        },
        {
            title: "Alta de localidad",
            description: "Registrar una nueva localidad para la operativa.",
            link: "/vendedor/alta-localidad",
            color: "#1abc9c"
        },
        {
            title: "Alta masiva de Localidades (CSV)",
            description: "Cargar múltiples localidades desde un archivo (ej. CSV).",
            link: "/vendedor/alta-masiva-localidades",
            color: "#2ecc71" // Un verde más fuerte
        },
        {
            title: "Alta de ómnibus",
            description: "Registrar un nuevo vehículo en la flota.",
            link: "/vendedor/alta-omnibus",
            color: "#3498db" // Azul
        },
        {
            title: "Alta masiva de ómnibus (CSV)",
            description: "Cargar datos de múltiples ómnibus vía archivo CSV.",
            link: "/vendedor/alta-masiva-omnibus",
            color: "#9b59b6" // Morado
        },
        {
            title: "Listado de ómnibus",
            description: "Ver y gestionar la flota de ómnibus existentes.",
            link: "/vendedor/listar-omnibus",
            color: "#f1c40f" // Amarillo
        },
        {
            title: "Marcar ómnibus como inactivo",
            description: "Marcar un ómnibus como no disponible para viajes.",
            link: "/vendedor/cambiar-a-inactivo", // Considera si esto es una acción en la lista de ómnibus
            color: "#e74c3c" // Rojo claro
        },
        {
            title: "Marcar ómnibus como activo",
            description: "Reactivar un ómnibus para asignarlo a viajes.",
            link: "/vendedor/cambiar-a-activo", // Considera si esto es una acción en la lista de ómnibus
            color: "#27ae60" // Verde oscuro
        },
        {
            title: "Alta de nuevo viaje",
            description: "Programar un nuevo viaje (ruta, horario, ómnibus).",
            link: "/vendedor/alta-viaje",
            color: "#e67e22" // Naranja
        },
        {
            title: "Reasignación de un viaje",
            description: "Modificar la asignación de ómnibus o detalles de un viaje.",
            link: "/vendedor/reasignar-viaje",
            color: "#d35400" // Naranja oscuro
        },
        {
            title: "Listado de viajes por ómnibus",
            description: "Consultar y gestionar todos los viajes planificados.",
            link: "/vendedor/listar-viajes",
            color: "#8e44ad" // Morado oscuro
        },
        // Puedes mantener o quitar estas si las anteriores las cubren o si son distintas
        // {
        //     title: "Gestionar Mis Ventas",
        //     description: "Ver historial de ventas y gestionar transacciones.",
        //     link: "/vendedor/mis-ventas",
        //     color: "#34495e" // Gris azulado oscuro
        // },
        // {
        //     title: "Ver Horarios de Viaje", // Podría ser cubierto por "Listar Viajes Programados"
        //     description: "Consultar los horarios y rutas disponibles.",
        //     link: "/vendedor/horarios",
        //     color: "#7f8c8d" // Gris
        // },
        {
            title: "Editar mis datos",
            description: "Actualizar tu información personal y contraseña.",
            link: "/editar-perfil", // Ruta general de edición de perfil
            color: "#bdc3c7" // Gris claro
        },
    ];

    return (
        <div className="vendedor-dashboard-container">
            <header className="vendedor-dashboard-header">
                <h1>Dashboard del Vendedor</h1>
                <p>Bienvenido, {user?.nombre || user?.email}! Desde aquí puedes gestionar tus actividades.</p>
            </header>

            <section className="vendedor-actions-grid">
                <h2>Acciones Disponibles</h2>
                <div className="actions-wrapper">
                    {vendedorActions.map((action, index) => (
                        <Link to={action.link} key={index} className="action-card-link">
                            <div className="action-card" style={{ '--action-color': action.color }}>
                                <div className="action-card-content">
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Puedes añadir más secciones aquí, como un resumen, notificaciones, etc. */}
        </div>
    );
};

export default VendedorDashboard;