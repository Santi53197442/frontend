// src/pages/vendedor/VendedorEstadisticasViaje.js

import React, { useState, useEffect } from 'react';
import { obtenerListadoViajesConPrecio } from '../../services/api';

// Importaciones para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importaciones para Gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Importación de Estilos
import './VendedorEstadisticasViaje.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const formatCurrency = (number) => {
    if (typeof number !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(number);
};

const VendedorEstadisticasViaje = () => {
    // Estados existentes
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);

    // Nuevo estado para el PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const cargarYProcesarDatos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await obtenerListadoViajesConPrecio();
                const viajes = response.data;

                if (viajes && viajes.length > 0) {
                    const precios = viajes.map(v => v.precio).filter(p => typeof p === 'number');
                    const sumaTotalPrecios = precios.reduce((sum, precio) => sum + precio, 0);
                    const precioPromedio = precios.length > 0 ? sumaTotalPrecios / precios.length : 0;

                    setStats({
                        totalViajes: viajes.length,
                        precioPromedio,
                        precioMasAlto: Math.max(...precios, 0),
                        precioMasBajo: Math.min(...precios, 0),
                    });

                    const statusCounts = viajes.reduce((acc, viaje) => {
                        acc[viaje.estado] = (acc[viaje.estado] || 0) + 1;
                        return acc;
                    }, {});

                    setPieChartData({
                        labels: Object.keys(statusCounts),
                        datasets: [{ label: 'Viajes por Estado', data: Object.values(statusCounts), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], borderColor: '#FFFFFF', borderWidth: 2 }],
                    });

                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    const monthlyCounts = Array(12).fill(0);
                    viajes.forEach(viaje => {
                        if (viaje.fecha) {
                            const month = new Date(viaje.fecha).getMonth();
                            monthlyCounts[month]++;
                        }
                    });

                    setBarChartData({
                        labels: monthNames,
                        datasets: [{ label: 'Cantidad de Viajes por Mes', data: monthlyCounts, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }],
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

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;

        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Viajes', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        pdf.setFontSize(16);
        pdf.text('Resumen General de Viajes', 15, yPosition);
        yPosition += 8;
        pdf.setFontSize(12);
        if (stats) {
            pdf.text(`- Total de Viajes Registrados: ${stats.totalViajes}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Precio Promedio por Viaje: ${formatCurrency(stats.precioPromedio)}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Precio del Viaje más Caro: ${formatCurrency(stats.precioMasAlto)}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Precio del Viaje más Barato: ${formatCurrency(stats.precioMasBajo)}`, 20, yPosition); yPosition += 5;
        }

        const addBlockToPDF = async (elementSelector) => {
            const element = document.querySelector(elementSelector);
            if (element) {
                const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = 180;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                if (yPosition + pdfHeight > 280) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
                yPosition += pdfHeight + 10;
            }
        };

        await addBlockToPDF('#pie-chart-container');
        await addBlockToPDF('#bar-chart-container');

        pdf.save('reporte-estadisticas-viajes.pdf');
        setIsGeneratingPDF(false);
    };

    const barChartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: false } }, // Título ya está en el <h3>
        animation: false // Desactivar animación para captura de PDF
    };

    const pieChartOptions = {
        responsive: true,
        animation: false // Desactivar animación para captura de PDF
    };

    if (loading) return <div className="stats-container-loading">Cargando estadísticas...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de viajes.</div>;

    return (
        <div className="stats-container">
            <div className="stats-header-with-button">
                <h2 className="stats-title">Estadísticas y Análisis de Viajes</h2>
                <button
                    onClick={handleDownloadPDF}
                    className="download-pdf-button"
                    disabled={isGeneratingPDF || loading}
                >
                    {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><h3 className="stat-card-title">Total de Viajes</h3><p className="stat-card-value">{stats.totalViajes}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Precio Promedio</h3><p className="stat-card-value">{formatCurrency(stats.precioPromedio)}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Viaje más Caro</h3><p className="stat-card-value">{formatCurrency(stats.precioMasAlto)}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Viaje más Barato</h3><p className="stat-card-value">{formatCurrency(stats.precioMasBajo)}</p></div>
            </div>

            <div className="charts-section">
                {pieChartData && (
                    <div id="pie-chart-container" className="chart-container">
                        <h3 className="chart-title">Distribución por Estado</h3>
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                )}
                {barChartData && (
                    <div id="bar-chart-container" className="chart-container">
                        <h3 className="chart-title">Viajes por Mes</h3>
                        <Bar options={barChartOptions} data={barChartData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorEstadisticasViaje;