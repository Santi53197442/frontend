// src/pages/vendedor/VendedorEstadisticasOmnibus.js
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasOmnibus } from '../../services/api';

// Importaciones para PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importaciones para Gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Importación de Estilos
import './VendedorEstadisticasOmnibus.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const VendedorEstadisticasOmnibus = () => {
    // Estados existentes
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [barChartData, setBarChartData] = useState(null);

    // Nuevo estado para el PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasOmnibus();
                const omnibusLista = response.data;

                if (omnibusLista && omnibusLista.length > 0) {
                    const capacidadTotal = omnibusLista.reduce((sum, bus) => sum + bus.capacidadAsientos, 0);
                    const capacidadPromedio = omnibusLista.length > 0 ? capacidadTotal / omnibusLista.length : 0;

                    setStats({
                        totalOmnibus: omnibusLista.length,
                        capacidadTotal,
                        capacidadPromedio: Math.round(capacidadPromedio)
                    });

                    const statusCounts = omnibusLista.reduce((acc, bus) => { acc[bus.estado] = (acc[bus.estado] || 0) + 1; return acc; }, {});
                    setPieChartData({
                        labels: Object.keys(statusCounts),
                        datasets: [{ label: 'Ómnibus por Estado', data: Object.values(statusCounts), backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384', '#36A2EB'], borderColor: '#FFFFFF', borderWidth: 2 }],
                    });

                    const locationCounts = omnibusLista.reduce((acc, bus) => { acc[bus.localidadActualNombre] = (acc[bus.localidadActualNombre] || 0) + 1; return acc; }, {});
                    setBarChartData({
                        labels: Object.keys(locationCounts),
                        datasets: [{ label: 'Cantidad de Ómnibus por Localidad', data: Object.values(locationCounts), backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 }],
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

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;

        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Flota', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        pdf.setFontSize(16);
        pdf.text('Resumen General de la Flota', 15, yPosition);
        yPosition += 10;

        const summaryData = [
            { label: 'Total de Ómnibus:', value: stats.totalOmnibus },
            { label: 'Capacidad Total de Asientos:', value: stats.capacidadTotal },
            { label: 'Capacidad Promedio por Ómnibus:', value: stats.capacidadPromedio },
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
            }
        };

        await addTwoChartsSideBySide('#omnibus-pie-chart', '#omnibus-bar-chart');

        pdf.save('reporte-estadisticas-omnibus.pdf');
        setIsGeneratingPDF(false);
    };

    const pieChartOptions = { responsive: true, animation: false };
    const barChartOptions = { indexAxis: 'y', responsive: true, animation: false };

    if (loading) return <div className="stats-container-loading">Cargando estadísticas...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de ómnibus.</div>;

    return (
        <div className="stats-container">
            <div className="stats-header-with-button">
                <h2 className="stats-title">Estadísticas de la Flota de Ómnibus</h2>
                <button
                    onClick={handleDownloadPDF}
                    className="download-pdf-button"
                    disabled={isGeneratingPDF || loading}
                >
                    {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte'}
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><h3 className="stat-card-title">Total de Ómnibus</h3><p className="stat-card-value">{stats.totalOmnibus}</p></div>
                <div className="stat-card"><h3 className="stat-card-title">Capacidad Total</h3><p className="stat-card-value">{stats.capacidadTotal}</p><small className="stat-card-note">Suma de todos los asientos</small></div>
                <div className="stat-card"><h3 className="stat-card-title">Capacidad Promedio</h3><p className="stat-card-value">{stats.capacidadPromedio}</p><small className="stat-card-note">Asientos por ómnibus</small></div>
            </div>

            <div className="charts-section">
                {pieChartData && (
                    <div id="omnibus-pie-chart" className="chart-container">
                        <h3 className="chart-title">Distribución por Estado</h3>
                        <Pie data={pieChartData} options={pieChartOptions} />
                    </div>
                )}
                {barChartData && (
                    <div id="omnibus-bar-chart" className="chart-container">
                        <h3 className="chart-title">Flota por Localidad</h3>
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendedorEstadisticasOmnibus;