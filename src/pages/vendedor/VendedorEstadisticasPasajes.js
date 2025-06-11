// src/pages/vendedor/VendedorEstadisticasPasajes.js
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasPasajes } from '../../services/api';

// Importaciones para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importaciones para Gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Importación de Estilos
import './VendedorEstadisticasPasajes.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const formatCurrency = (number) => {
    if (typeof number !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(number);
};

const VendedorEstadisticasPasajes = () => {
    // Estados existentes
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);
    const [topRoutesData, setTopRoutesData] = useState(null);

    // Nuevo estado para el PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasPasajes();
                const pasajes = response.data;

                if (pasajes && pasajes.length > 0) {
                    const pasajesVendidos = pasajes.filter(p => p.estado === 'VENDIDO');
                    const totalIngresos = pasajesVendidos.reduce((sum, p) => sum + p.precio, 0);
                    const precioPromedio = pasajesVendidos.length > 0 ? totalIngresos / pasajesVendidos.length : 0;
                    setStats({ totalIngresos, totalPasajesVendidos: pasajesVendidos.length, precioPromedio });

                    const statusCounts = pasajes.reduce((acc, p) => { acc[p.estado] = (acc[p.estado] || 0) + 1; return acc; }, {});
                    setPieChartData({ labels: Object.keys(statusCounts), datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#4BC0C0', '#FF6384', '#FFCE56'] }] });

                    const monthlyRevenue = Array(12).fill(0);
                    pasajesVendidos.forEach(p => { if (p.fechaViaje) { const month = new Date(p.fechaViaje).getMonth(); monthlyRevenue[month] += p.precio; } });
                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    setBarChartData({ labels: monthNames, datasets: [{ label: 'Ingresos por Mes', data: monthlyRevenue, backgroundColor: 'rgba(75, 192, 192, 0.6)' }] });

                    const routeCounts = pasajesVendidos.reduce((acc, p) => { acc[p.ruta] = (acc[p.ruta] || 0) + 1; return acc; }, {});
                    const sortedRoutes = Object.entries(routeCounts).sort(([, a], [, b]) => b - a).slice(0, 7);
                    setTopRoutesData({ labels: sortedRoutes.map(item => item[0]), datasets: [{ label: 'Cantidad de Pasajes Vendidos', data: sortedRoutes.map(item => item[1]), backgroundColor: 'rgba(255, 159, 64, 0.6)' }] });
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

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;

        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Ventas', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        pdf.setFontSize(16);
        pdf.text('Resumen de Ventas', 15, yPosition);
        yPosition += 10;

        const summaryData = [
            { label: 'Ingresos Totales:', value: formatCurrency(stats.totalIngresos) },
            { label: 'Total Pasajes Vendidos:', value: stats.totalPasajesVendidos },
            { label: 'Precio Promedio por Pasaje:', value: formatCurrency(stats.precioPromedio) },
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

        const addBlockToPDF = async (selector) => {
            const element = document.querySelector(selector);
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

        await addBlockToPDF('#pasajes-charts-section');
        await addBlockToPDF('#pasajes-top-routes-chart');

        pdf.save('reporte-estadisticas-pasajes.pdf');
        setIsGeneratingPDF(false);
    };

    const chartOptions = { responsive: true, animation: false };
    const horizontalBarOptions = { indexAxis: 'y', responsive: true, animation: false };

    if (loading) return <div className="stats-container-loading">Cargando...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos.</div>;

    return (
        <div className="stats-container">
            <div className="stats-header-with-button">
                <h2 className="stats-title">Estadísticas de Ventas y Rendimiento</h2>
                <button
                    onClick={handleDownloadPDF}
                    className="download-pdf-button"
                    disabled={isGeneratingPDF || loading}
                >
                    {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><h3 className="stat-card-title">Ingresos Totales</h3><p className="stat-card-value">{formatCurrency(stats.totalIngresos)}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Pasajes Vendidos</h3><p className="stat-card-value">{stats.totalPasajesVendidos}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Precio Promedio</h3><p className="stat-card-value">{formatCurrency(stats.precioPromedio)}</p></div>
            </div>

            <div id="pasajes-charts-section" className="charts-section">
                {pieChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución de Pasajes</h3>
                        <Pie data={pieChartData} options={chartOptions} />
                    </div>
                )}
                {barChartData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Ingresos Mensuales</h3>
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                )}
            </div>

            {topRoutesData && (
                <div id="pasajes-top-routes-chart" className="chart-container-fullwidth">
                    <h3 className="chart-title">Rutas Más Populares</h3>
                    <Bar data={topRoutesData} options={horizontalBarOptions} />
                </div>
            )}
        </div>
    );
};

export default VendedorEstadisticasPasajes;