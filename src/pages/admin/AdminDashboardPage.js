// src/pages/admin/AdminDashboardPage.js

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
import './AdminDashboardPage.css'; // Asegúrate de que este archivo CSS existe

// Registrar todos los componentes de Chart.js necesarios
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
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/admin/dashboard/statistics');
                setStats(response.data);
            } catch (err) {
                console.error("Error al cargar estadísticas:", err);
                setError(err.response?.data?.message || 'Error al cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // --- GUARDAS PARA ESTADOS DE CARGA, ERROR Y DATOS NULOS ---
    if (loading) return <div className="loading-message">Cargando estadísticas...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!stats) return <div className="info-message">No se encontraron datos de estadísticas.</div>;

    // --- Preparar datos para los gráficos ---
    const roleChartData = {
        labels: stats.userRoleCounts?.map(d => d.roleName) || [],
        datasets: [{
            label: 'Nº de Usuarios',
            data: stats.userRoleCounts?.map(d => d.count) || [],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            hoverOffset: 4,
        }],
    };

    const ageChartData = {
        labels: stats.userAgeDistribution?.map(d => d.ageGroup) || [],
        datasets: [{
            label: 'Nº de Usuarios',
            data: stats.userAgeDistribution?.map(d => d.count) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const creationChartData = {
        labels: stats.userCreationOverTime?.map(d => new Date(d.creationDate).toLocaleDateString()) || [],
        datasets: [{
            label: 'Nuevos Usuarios por Día',
            data: stats.userCreationOverTime?.map(d => d.count) || [],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
        }],
    };

    // Lista de tarjetas de estadísticas para mapear y renderizar
    const statCards = [
        {
            key: 'roles',
            title: 'Usuarios por Rol',
            data: stats.userRoleCounts,
            chartComponent: <Doughnut data={roleChartData} />,
            pdfHeaders: ['Rol', 'Cantidad'],
            pdfData: stats.userRoleCounts?.map(item => [item.roleName, item.count]),
            csvData: stats.userRoleCounts
        },
        {
            key: 'edad',
            title: 'Distribución por Edad',
            data: stats.userAgeDistribution,
            chartComponent: <Bar data={ageChartData} />,
            pdfHeaders: ['Grupo de Edad', 'Cantidad'],
            pdfData: stats.userAgeDistribution?.map(item => [item.ageGroup, item.count]),
            csvData: stats.userAgeDistribution
        },
        {
            key: 'creacion',
            title: 'Creación de Usuarios en el Tiempo',
            data: stats.userCreationOverTime,
            chartComponent: <Line data={creationChartData} />,
            pdfHeaders: ['Fecha', 'Cantidad'],
            pdfData: stats.userCreationOverTime?.map(item => [new Date(item.creationDate).toLocaleDateString(), item.count]),
            // Formatear datos para CSV para que la fecha se vea bien
            csvData: stats.userCreationOverTime?.map(item => ({ fecha: new Date(item.creationDate).toLocaleDateString(), cantidad: item.count }))
        }
    ];

    return (
        <div className="dashboard-container">
            <h1>Dashboard de Estadísticas</h1>

            {statCards.map(card => (
                <div key={card.key} className="stat-card">
                    <h2>{card.title}</h2>
                    {card.data && card.data.length > 0 ? (
                        <>
                            <div className="chart-wrapper">
                                {card.chartComponent}
                            </div>
                            <div className="download-buttons">
                                <button onClick={() => downloadPDF(card.title, card.pdfHeaders, card.pdfData)}>Descargar PDF</button>
                                <button onClick={() => downloadCSV(card.title, card.csvData)}>Descargar CSV</button>
                            </div>
                        </>
                    ) : (
                        <p className="info-message">No hay datos disponibles para este gráfico.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AdminDashboardPage;