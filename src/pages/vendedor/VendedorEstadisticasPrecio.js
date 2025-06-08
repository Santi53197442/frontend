import React, { useState, useEffect } from 'react';
import { obtenerListadoViajesConPrecio } from '../../services/apiService'; // Ajusta la ruta a tu archivo apiService.js
import './VendedorEstadisticasPrecio.css'; // Crearemos este archivo para los estilos

// Función auxiliar para formatear los precios a un formato de moneda
const formatCurrency = (number) => {
    if (typeof number !== 'number') {
        return 'N/A';
    }
    // Puedes ajustar 'es-UY' y 'UYU' a tu país y moneda local
    // Ej: 'es-AR', 'ARS' para Argentina o 'en-US', 'USD' para USA.
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
    }).format(number);
};

const VendedorEstadisticasPrecio = () => {
    // Estado para guardar las estadísticas calculadas
    const [stats, setStats] = useState(null);
    // Estado para el manejo de la carga
    const [loading, setLoading] = useState(true);
    // Estado para el manejo de errores
    const [error, setError] = useState(null);

    useEffect(() => {
        // Función asíncrona para cargar los datos y calcular las estadísticas
        const cargarYCalcularEstadisticas = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Llamar a la API para obtener el listado de viajes
                const response = await obtenerListadoViajesConPrecio();
                const viajes = response.data;

                // 2. Calcular las estadísticas si hay viajes
                if (viajes && viajes.length > 0) {
                    const precios = viajes.map(v => v.precio);

                    const ingresoPotencialTotal = precios.reduce((sum, precio) => sum + precio, 0);
                    const precioPromedio = ingresoPotencialTotal / viajes.length;
                    const precioMasAlto = Math.max(...precios);
                    const precioMasBajo = Math.min(...precios);

                    setStats({
                        totalViajes: viajes.length,
                        ingresoPotencialTotal,
                        precioPromedio,
                        precioMasAlto,
                        precioMasBajo,
                    });
                } else {
                    // Estado por defecto si no hay viajes
                    setStats({
                        totalViajes: 0,
                        ingresoPotencialTotal: 0,
                        precioPromedio: 0,
                        precioMasAlto: 0,
                        precioMasBajo: 0,
                    });
                }
            } catch (err) {
                console.error("Error al cargar estadísticas de precios:", err);
                setError("No se pudieron cargar las estadísticas. Por favor, intente de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        cargarYCalcularEstadisticas();
    }, []); // El array vacío asegura que esto se ejecute solo una vez

    // Renderizado condicional basado en el estado
    if (loading) {
        return <div className="stats-container-loading">Cargando estadísticas...</div>;
    }

    if (error) {
        return <div className="stats-container-error">{error}</div>;
    }

    if (!stats) {
        return <div className="stats-container">No hay datos disponibles.</div>;
    }

    // Renderizado principal de las estadísticas
    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas de Precios de Viajes</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-card-title">Total de Viajes</h3>
                    <p className="stat-card-value">{stats.totalViajes}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Precio Promedio</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioPromedio)}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Ingreso Potencial Total</h3>
                    <p className="stat-card-value">{formatCurrency(stats.ingresoPotencialTotal)}</p>
                    <small className="stat-card-note">Suma de todos los precios de viaje</small>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Viaje más Caro</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioMasAlto)}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Viaje más Barato</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioMasBajo)}</p>
                </div>
            </div>
        </div>
    );
};

export default VendedorEstadisticasPrecio;