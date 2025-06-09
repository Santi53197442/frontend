// src/pages/vendedor/VendedorEstadisticasPasajes.js
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasPasajes } from '../../services/api';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import './VendedorEstadisticasPasajes.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const formatCurrency = (number) => {
    if (typeof number !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(number);
};

const VendedorEstadisticasPasajes = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);
    const [topRoutesData, setTopRoutesData] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasPasajes();
                const pasajes = response.data;

                if (pasajes && pasajes.length > 0) {
                    // **Filtramos solo los pasajes VENDIDOS para métricas de ingresos**
                    const pasajesVendidos = pasajes.filter(p => p.estado === 'VENDIDO');

                    // --- Cálculo de Estadísticas ---
                    const totalIngresos = pasajesVendidos.reduce((sum, p) => sum + p.precio, 0);
                    const precioPromedio = totalIngresos / pasajesVendidos.length;

                    setStats({
                        totalIngresos,
                        totalPasajesVendidos: pasajesVendidos.length,
                        precioPromedio: precioPromedio || 0
                    });

                    // --- Gráfico de Pastel (por Estado) ---
                    const statusCounts = pasajes.reduce((acc, p) => {
                        acc[p.estado] = (acc[p.estado] || 0) + 1;
                        return acc;
                    }, {});
                    setPieChartData({
                        labels: Object.keys(statusCounts),
                        datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56'], }],
                    });

                    // --- Gráfico de Barras (Ingresos por Mes) ---
                    const monthlyRevenue = Array(12).fill(0);
                    pasajesVendidos.forEach(p => {
                        const month = new Date(p.fechaViaje).getMonth();
                        monthlyRevenue[month] += p.precio;
                    });
                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    setBarChartData({
                        labels: monthNames,
                        datasets: [{ label: 'Ingresos por Mes', data: monthlyRevenue, backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
                    });

                    // --- Gráfico de Barras Horizontales (Rutas más Populares) ---
                    const routeCounts = pasajesVendidos.reduce((acc, p) => {
                        acc[p.ruta] = (acc[p.ruta] || 0) + 1;
                        return acc;
                    }, {});
                    const sortedRoutes = Object.entries(routeCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 7); // Tomamos las 7 rutas más populares

                    setTopRoutesData({
                        labels: sortedRoutes.map(item => item[0]),
                        datasets: [{ label: 'Cantidad de Pasajes Vendidos', data: sortedRoutes.map(item => item[1]), backgroundColor: 'rgba(255, 159, 64, 0.6)' }],
                    });

                } else {
                    setStats({ totalIngresos: 0, totalPasajesVendidos: 0, precioPromedio: 0 });
                }
            } catch (err) {
                setError("No se pudieron cargar las estadísticas de ventas.");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    if (loading) return <div className="stats-container-loading">Cargando estadísticas de ventas...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de ventas para mostrar.</div>;

    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas de Ventas y Rendimiento</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-card-title">Ingresos Totales</h3>
                    <p className="stat-card-value">{formatCurrency(stats.totalIngresos)}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Pasajes Vendidos</h3>
                    <p className="stat-card-value">{stats.totalPasajesVendidos}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Precio Promedio</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioPromedio)}</p>
                </div>
            </div>

            <div className="charts-section">
                {pieChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución de Pasajes</h3>
                        <Pie data={pieChartData} />
                    </div>
                )}
                {barChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Ingresos Mensuales</h3>
                        <Bar data={barChartData} />
                    </div>
                )}
            </div>

            {topRoutesData && (
                <div className="chart-container-fullwidth">
                    <h3 className="chart-title">Rutas Más Populares</h3>
                    <Bar data={topRoutesData} options={{ indexAxis: 'y', responsive: true }} />
                </div>
            )}
        </div>
    );
};

export default VendedorEstadisticasPasajes;