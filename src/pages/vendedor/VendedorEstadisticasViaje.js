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
    // Estados del componente
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);
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

        // --- Título del Reporte ---
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Viajes', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        // --- Resumen General (con formato de dos columnas para alineación) ---
        pdf.setFontSize(16);
        pdf.text('Resumen General de Viajes', 15, yPosition);
        yPosition += 10;

        const summaryData = [
            { label: 'Total de Viajes Registrados:', value: stats.totalViajes },
            { label: 'Precio Promedio por Viaje:', value: formatCurrency(stats.precioPromedio) },
            { label: 'Precio del Viaje más Caro:', value: formatCurrency(stats.precioMasAlto) },
            { label: 'Precio del Viaje más Barato:', value: formatCurrency(stats.precioMasBajo) },
        ];

        pdf.setFontSize(12);
        summaryData.forEach(item => {
            pdf.setFont('helvetica', 'bold');
            pdf.text(item.label, 20, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(String(item.value), 90, yPosition);
            yPosition += 8;
        });
        yPosition += 10;

        // --- Función mejorada para colocar dos gráficos uno al lado del otro ---
        const addTwoChartsSideBySide = async (selector1, selector2) => {
            const element1 = document.querySelector(selector1);
            const element2 = document.querySelector(selector2);

            if (element1 && element2) {
                const [canvas1, canvas2] = await Promise.all([
                    html2canvas(element1, { scale: 2, backgroundColor: '#ffffff' }),
                    html2canvas(element2, { scale: 2, backgroundColor: '#ffffff' })
                ]);

                const imgData1 = canvas1.toDataURL('image/png');
                const imgData2 = canvas2.toDataURL('image/png');

                const colWidth = 88;
                const gap = 4;
                const img1Height = (canvas1.height * colWidth) / canvas1.width;
                const img2Height = (canvas2.height * colWidth) / canvas2.width;
                const maxHeight = Math.max(img1Height, img2Height);

                if (yPosition + maxHeight > 280) {
                    pdf.addPage();
                    yPosition = 20;
                }

                pdf.addImage(imgData1, 'PNG', 15, yPosition, colWidth, img1Height);
                pdf.addImage(imgData2, 'PNG', 15 + colWidth + gap, yPosition, colWidth, img2Height);

                yPosition += maxHeight + 10;
            } else {
                console.error("No se pudieron encontrar los contenedores de los gráficos para el PDF.");
            }
        };

        await addTwoChartsSideBySide('#pie-chart-container', '#bar-chart-container');

        pdf.save('reporte-estadisticas-viajes.pdf');
        setIsGeneratingPDF(false);
    };

    const chartOptions = {
        responsive: true,
        animation: false // Desactivar animación para captura de PDF
    };

    if (loading) return <div className="stats-container-loading">Cargando estadísticas...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de viajes para mostrar.</div>;

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
                {pieChartData && pieChartData.labels.length > 0 && (
                    <div id="pie-chart-container" className="chart-container">
                        <h3 className="chart-title">Distribución por Estado</h3>
                        <Pie data={pieChartData} options={chartOptions} />
                    </div>
                )}
                {barChartData && (
                    <div id="bar-chart-container" className="chart-container">
                        <h3 className="chart-title">Viajes por Mes</h3>
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorEstadisticasViaje;