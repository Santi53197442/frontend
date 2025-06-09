// src/pages/admin/AdminEstadisticasUsuarios.js
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasUsuarios } from '../../services/api';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

import './AdminEstadisticasUsuarios.css'; // Asegúrate de crear este archivo

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const AdminEstadisticasUsuarios = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleDistData, setRoleDistData] = useState(null);
    const [clientTypeData, setClientTypeData] = useState(null);
    const [userGrowthData, setUserGrowthData] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasUsuarios();
                const usuarios = response.data;

                if (usuarios && usuarios.length > 0) {
                    // --- Cálculo de Estadísticas para las Tarjetas ---
                    const totalAdmins = usuarios.filter(u => u.rol === 'ADMINISTRADOR').length;
                    const totalVendedores = usuarios.filter(u => u.rol === 'VENDEDOR').length;
                    const totalClientes = usuarios.filter(u => u.rol === 'CLIENTE').length;
                    setStats({
                        totalUsuarios: usuarios.length,
                        totalAdmins,
                        totalVendedores,
                        totalClientes
                    });

                    // --- Gráfico de Pastel (Distribución de Roles) ---
                    setRoleDistData({
                        labels: ['Clientes', 'Vendedores', 'Administradores'],
                        datasets: [{ data: [totalClientes, totalVendedores, totalAdmins], backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'] }],
                    });

                    // --- Gráfico de Pastel (Tipos de Cliente) ---
                    const clientes = usuarios.filter(u => u.rol === 'CLIENTE');
                    const clientTypeCounts = clientes.reduce((acc, c) => {
                        acc[c.tipoCliente] = (acc[c.tipoCliente] || 0) + 1;
                        return acc;
                    }, {});
                    setClientTypeData({
                        labels: Object.keys(clientTypeCounts),
                        datasets: [{ data: Object.values(clientTypeCounts), backgroundColor: ['#4BC0C0', '#9966FF'] }],
                    });

                    // --- Gráfico de Líneas (Crecimiento de Usuarios) ---
                    const monthlySignups = Array(12).fill(0);
                    usuarios.forEach(u => {
                        const month = new Date(u.fechaCreacion).getMonth();
                        monthlySignups[month]++;
                    });
                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    setUserGrowthData({
                        labels: monthNames,
                        datasets: [{
                            label: 'Nuevos Registros por Mes',
                            data: monthlySignups,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            fill: true,
                            tension: 0.1
                        }],
                    });

                } else {
                    setStats({ totalUsuarios: 0, totalAdmins: 0, totalVendedores: 0, totalClientes: 0 });
                }
            } catch (err) {
                setError("No se pudieron cargar las estadísticas de usuarios.");
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    if (loading) return <div className="stats-container-loading">Cargando estadísticas de usuarios...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de usuarios para mostrar.</div>;

    return (
        <div className="stats-container">
            <h2 className="stats-title">Estadísticas de la Comunidad de Usuarios</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-card-title">Usuarios Totales</h3>
                    <p className="stat-card-value">{stats.totalUsuarios}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Clientes</h3>
                    <p className="stat-card-value">{stats.totalClientes}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Vendedores</h3>
                    <p className="stat-card-value">{stats.totalVendedores}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-card-title">Administradores</h3>
                    <p className="stat-card-value">{stats.totalAdmins}</p>
                </div>
            </div>

            {userGrowthData && (
                <div className="chart-container-fullwidth">
                    <h3 className="chart-title">Crecimiento de Usuarios (Registros por Mes)</h3>
                    <Line data={userGrowthData} />
                </div>
            )}

            <div className="charts-section">
                {roleDistData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Rol</h3>
                        <Pie data={roleDistData} />
                    </div>
                )}
                {clientTypeData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Tipos de Cliente</h3>
                        <Pie data={clientTypeData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEstadisticasUsuarios;