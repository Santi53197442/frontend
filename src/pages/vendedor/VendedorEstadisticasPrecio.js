// src/pages/vendedor/VendedorEstadisticasPrecio.js

import React, { useState, useEffect } from 'react';
import { obtenerListadoViajesConPrecio } from '../../services/api'; // Ajusta la ruta si es necesario

// 1. Importaciones necesarias de Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import './VendedorEstadisticasPrecio.css'; // Usaremos el mismo archivo CSS y le añadiremos estilos

// 2. Registrar los componentes de Chart.js que vamos a usar
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Función auxiliar para formatear moneda
const formatCurrency = (number) => {
    if (typeof number !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(number);
};

const VendedorEstadisticasPrecio = () => {
    // Estados existentes
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Nuevos estados para los datos de los gráficos
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);

    useEffect(() => {
        const cargarYProcesarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await obtenerListadoViajesConPrecio();
                const viajes = response.data;

                if (viajes && viajes.length > 0) {
                    // --- Cálculo de estadísticas (sin cambios) ---
                    const precios = viajes.map(v => v.precio);
                    const ingresoPotencialTotal = precios.reduce((sum, precio) => sum + precio, 0);
                    const precioPromedio = ingresoPotencialTotal / viajes.length;
                    setStats({
                        totalViajes: viajes.length,
                        ingresoPotencialTotal,
                        precioPromedio,
                        precioMasAlto: Math.max(...precios),
                        precioMasBajo: Math.min(...precios),
                    });

                    // --- 4. Procesamiento de datos para los gráficos ---

                    // Para el Gráfico de Pastel (por estado)
                    const statusCounts = viajes.reduce((acc, viaje) => {
                        acc[viaje.estado] = (acc[viaje.estado] || 0) + 1;
                        return acc;
                    }, {});

                    setPieChartData({
                        labels: Object.keys(statusCounts),
                        datasets: [{
                            label: 'Viajes por Estado',
                            data: Object.values(statusCounts),
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                            borderColor: '#FFFFFF',
                            borderWidth: 2,
                        }],
                    });

                    // Para el Gráfico de Barras (por mes)
                    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const monthlyCounts = Array(12).fill(0);
                    viajes.forEach(viaje => {
                        const month = new Date(viaje.fecha).getMonth(); // 0 = Enero, 11 = Diciembre
                        monthlyCounts[month]++;
                    });

                    setBarChartData({
                        labels: monthNames,
                        datasets: [{
                            label: 'Cantidad de Viajes por Mes',
                            data: monthlyCounts,
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        }],
                    });

                } else {
                    setStats({ totalViajes: 0, ingresoPotencialTotal: 0, precioPromedio: 0, precioMasAlto: 0, precioMasBajo: 0 });
                }
            } catch (err) {
                console.error("Error al cargar datos y gráficos:", err);
                setError("No se pudieron cargar los datos. Por favor, intente de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        cargarYProcesarDatos();
    }, []);

    // Opciones para el gráfico de barras para que tenga un título
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Volumen de Viajes Mensual',
            },
        },
    };

    if (loading) {
        return <div className="stats-container-loading">Cargando estadísticas y gráficos...</div>;
    }

    if (error) {
        return <div className="stats-container-error">{error}</div>;
    }

    if (!stats) {
        return <div className="stats-container">No hay datos de viajes para mostrar.</div>;
    }

    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas y Análisis de Viajes</h2>

            {/* --- Tarjetas de Estadísticas (sin cambios) --- */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-card-title">Total de Viajes</h3>
                    <p className="stat-card-value">{stats.totalViajes}</p>
                </div>
                {/* ... otras tarjetas ... */}
                <div className="stat-card">
                    <h3 className="stat-card-title">Precio Promedio</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioPromedio)}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Ingreso Potencial Total</h3>
                    <p className="stat-card-value">{formatCurrency(stats.ingresoPotencialTotal)}</p>
                    <small className="stat-card-note">Suma de todos los precios</small>
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

            {/* --- 5. Nueva sección para los gráficos --- */}
            <div className="charts-section">
                {pieChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Estado (Pastel)</h3>
                        <Pie data={pieChartData} />
                    </div>
                )}
                {barChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Viajes por Mes (Barras)</h3>
                        <Bar options={barChartOptions} data={barChartData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorEstadisticasPrecio;