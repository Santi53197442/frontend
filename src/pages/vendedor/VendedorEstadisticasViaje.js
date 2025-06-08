// src/pages/vendedor/VendedorEstadisticasViaje.js

import React, { useState, useEffect } from 'react';
import { obtenerListadoViajesConPrecio } from '../../services/apiService';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import './VendedorEstadisticasViaje.css'; // <<-- CAMBIO AQUÍ

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const formatCurrency = (number) => {
    if (typeof number !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(number);
};

// VVV-- CAMBIO AQUÍ --VVV
const VendedorEstadisticasViaje = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                    const precios = viajes.map(v => v.precio);
                    const sumaTotalPrecios = precios.reduce((sum, precio) => sum + precio, 0);
                    const precioPromedio = sumaTotalPrecios / viajes.length;

                    setStats({
                        totalViajes: viajes.length,
                        precioPromedio,
                        precioMasAlto: Math.max(...precios),
                        precioMasBajo: Math.min(...precios),
                    });

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

                    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    const monthlyCounts = Array(12).fill(0);
                    viajes.forEach(viaje => {
                        const month = new Date(viaje.fecha).getMonth();
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
                    setStats({ totalViajes: 0, precioPromedio: 0, precioMasAlto: 0, precioMasBajo: 0 });
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

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Volumen de Viajes Mensual' },
        },
    };

    if (loading) return <div className="stats-container-loading">Cargando estadísticas y gráficos...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de viajes para mostrar.</div>;

    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas y Análisis de Viajes</h2>
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
                    <h3 className="stat-card-title">Viaje más Caro</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioMasAlto)}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Viaje más Barato</h3>
                    <p className="stat-card-value">{formatCurrency(stats.precioMasBajo)}</p>
                </div>
            </div>
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

// VVV-- CAMBIO AQUÍ --VVV
export default VendedorEstadisticasViaje;