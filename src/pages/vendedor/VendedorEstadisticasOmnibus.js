// src/pages/vendedor/VendedorEstadisticasOmnibus.js
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasOmnibus } from '../../services/api';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import './VendedorEstadisticasOmnibus.css'; // Asegúrate de que este archivo exista

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const VendedorEstadisticasOmnibus = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasOmnibus();
                const omnibusLista = response.data;

                if (omnibusLista && omnibusLista.length > 0) {
                    // --- Cálculo de Estadísticas ---
                    const capacidadTotal = omnibusLista.reduce((sum, bus) => sum + bus.capacidadAsientos, 0);
                    const capacidadPromedio = capacidadTotal / omnibusLista.length;

                    setStats({
                        totalOmnibus: omnibusLista.length,
                        capacidadTotal,
                        capacidadPromedio: Math.round(capacidadPromedio)
                    });

                    // --- Gráfico de Pastel (por Estado) ---
                    const statusCounts = omnibusLista.reduce((acc, bus) => {
                        acc[bus.estado] = (acc[bus.estado] || 0) + 1;
                        return acc;
                    }, {});
                    setPieChartData({
                        labels: Object.keys(statusCounts),
                        datasets: [{
                            label: 'Ómnibus por Estado',
                            data: Object.values(statusCounts),
                            backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384', '#36A2EB'],
                            borderColor: '#FFFFFF',
                            borderWidth: 2,
                        }],
                    });

                    // --- Gráfico de Barras (por Localidad) ---
                    const locationCounts = omnibusLista.reduce((acc, bus) => {
                        acc[bus.localidadActualNombre] = (acc[bus.localidadActualNombre] || 0) + 1;
                        return acc;
                    }, {});
                    setBarChartData({
                        labels: Object.keys(locationCounts),
                        datasets: [{
                            label: 'Cantidad de Ómnibus por Localidad',
                            data: Object.values(locationCounts),
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                        }],
                    });

                } else {
                    setStats({ totalOmnibus: 0, capacidadTotal: 0, capacidadPromedio: 0 });
                }
            } catch (err) {
                setError("No se pudieron cargar las estadísticas de la flota.");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    if (loading) return <div className="stats-container-loading">Cargando estadísticas de la flota...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de ómnibus para mostrar.</div>;

    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas de la Flota de Ómnibus</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-card-title">Total de Ómnibus</h3>
                    <p className="stat-card-value">{stats.totalOmnibus}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Capacidad Total</h3>
                    <p className="stat-card-value">{stats.capacidadTotal}</p>
                    <small className="stat-card-note">Suma de todos los asientos</small>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Capacidad Promedio</h3>
                    <p className="stat-card-value">{stats.capacidadPromedio}</p>
                    <small className="stat-card-note">Asientos por ómnibus</small>
                </div>
            </div>

            <div className="charts-section">
                {pieChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Estado</h3>
                        <Pie data={pieChartData} />
                    </div>
                )}
                {barChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Flota por Localidad</h3>
                        <Bar data={barChartData} options={{ indexAxis: 'y' }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorEstadisticasOmnibus;