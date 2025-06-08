// src/pages/AdminDashboardPage/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import './AdminDashboardPage.css'; // Crea este archivo para estilos

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

// --- Helper para Descargas ---
const downloadPDF = (title, headers, data) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 20,
    });
    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

const downloadCSV = (title, data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/admin/dashboard/statistics');
                setStats(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Cargando estadísticas...</div>;
    if (error) return <div className="error-message">{error}</div>;

    // --- Preparar datos para los gráficos ---
    const roleChartData = {
        labels: stats.userRoleCounts.map(d => d.roleName),
        datasets: [{
            label: 'Nº de Usuarios',
            data: stats.userRoleCounts.map(d => d.count),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        }],
    };

    const ageChartData = {
        labels: stats.userAgeDistribution.map(d => d.ageGroup),
        datasets: [{
            label: 'Nº de Usuarios',
            data: stats.userAgeDistribution.map(d => d.count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };

    const creationChartData = {
        labels: stats.userCreationOverTime.map(d => new Date(d.creationDate).toLocaleDateString()),
        datasets: [{
            label: 'Nuevos Usuarios por Día',
            data: stats.userCreationOverTime.map(d => d.count),
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
        }],
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard de Estadísticas</h1>

            <div className="stat-card">
                <h2>Usuarios por Rol</h2>
                <div className="chart-wrapper">
                    <Doughnut data={roleChartData} />
                </div>
                <div className="download-buttons">
                    <button onClick={() => downloadPDF('Usuarios por Rol', ['Rol', 'Cantidad'], stats.userRoleCounts.map(item => [item.roleName, item.count]))}>Descargar PDF</button>
                    <button onClick={() => downloadCSV('Usuarios por Rol', stats.userRoleCounts)}>Descargar CSV</button>
                </div>
            </div>

            <div className="stat-card">
                <h2>Distribución por Edad</h2>
                <div className="chart-wrapper">
                    <Bar data={ageChartData} />
                </div>
                <div className="download-buttons">
                    <button onClick={() => downloadPDF('Distribución por Edad', ['Grupo de Edad', 'Cantidad'], stats.userAgeDistribution.map(item => [item.ageGroup, item.count]))}>Descargar PDF</button>
                    <button onClick={() => downloadCSV('Distribución por Edad', stats.userAgeDistribution)}>Descargar CSV</button>
                </div>
            </div>

            <div className="stat-card">
                <h2>Creación de Usuarios en el Tiempo</h2>
                <div className="chart-wrapper">
                    <Line data={creationChartData} />
                </div>
                <div className="download-buttons">
                    <button onClick={() => downloadPDF('Creación de Usuarios', ['Fecha', 'Cantidad'], stats.userCreationOverTime.map(item => [new Date(item.creationDate).toLocaleDateString(), item.count]))}>Descargar PDF</button>
                    <button onClick={() => downloadCSV('Creación de Usuarios', stats.userCreationOverTime.map(item => ({ fecha: new Date(item.creationDate).toLocaleDateString(), cantidad: item.count }))) }>Descargar CSV</button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;