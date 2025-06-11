// src/pages/admin/AdminEstadisticasUsuarios.js

// 1. Importar las nuevas bibliotecas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import React, { useState, useEffect } from 'react';
// La llamada a la API y las importaciones de Chart.js no cambian
import { obtenerEstadisticasUsuarios } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import './AdminEstadisticasUsuarios.css';

// ... (El resto de tus imports y registros de Chart.js no cambian)
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);
const calculateAge = (birthDate) => { /* ... (sin cambios) */ };

const AdminEstadisticasUsuarios = () => {
    // ... (Todos tus estados existentes no cambian)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleDistData, setRoleDistData] = useState(null);
    const [userGrowthData, setUserGrowthData] = useState(null);
    const [ageDistData, setAgeDistData] = useState(null);

    // 2. Nuevo estado para el feedback de la generación del PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        // ... (La lógica de useEffect para cargar datos no cambia en absoluto)
        const cargarDatos = async () => { /* ... (tu código existente) */ };
        cargarDatos();
    }, []);

    // 3. Nueva función para generar y descargar el PDF
    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);

        // Seleccionamos los contenedores de los gráficos por su clase
        const lineChartElement = document.querySelector('#line-chart-container');
        const pieChartsContainer = document.querySelector('#pie-charts-container');
        const barChartElement = document.querySelector('#bar-chart-container');

        // Creamos una instancia de jsPDF en formato A4, vertical
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20; // Posición vertical inicial

        // --- Título del PDF ---
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Usuarios', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        // --- Tarjetas de Resumen (las añadimos como texto) ---
        pdf.setFontSize(16);
        pdf.text('Resumen General', 15, yPosition);
        yPosition += 8;
        pdf.setFontSize(12);
        if (stats) {
            pdf.text(`- Usuarios Totales: ${stats.totalUsuarios}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Clientes: ${stats.totalClientes}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Vendedores: ${stats.totalVendedores}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Administradores: ${stats.totalAdmins}`, 20, yPosition); yPosition += 15;
        }

        // --- Añadir Gráficos como Imágenes ---
        const addChartToPDF = async (element, title) => {
            if (element) {
                // Manejo de salto de página si no hay espacio
                if (yPosition > 220) { // Un umbral seguro antes del final de la página (297mm)
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.setFontSize(16);
                pdf.text(title, 15, yPosition);
                yPosition += 10;

                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');

                const pdfWidth = 180; // Ancho de la imagen en el PDF (A4 es 210mm de ancho)
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
                yPosition += pdfHeight + 15; // Actualizar posición para el siguiente elemento
            }
        };

        // Procesamos cada gráfico en orden
        await addChartToPDF(lineChartElement, 'Crecimiento de Usuarios');
        await addChartToPDF(pieChartsContainer, 'Distribución de Roles y Tipos');
        await addChartToPDF(barChartElement, 'Distribución de Edades');

        // --- Guardar el PDF ---
        pdf.save('reporte-estadisticas-usuarios.pdf');
        setIsGeneratingPDF(false);
    };


    if (loading) return <div className="stats-container-loading">Cargando...</div>;
    // ... (resto de tus return de loading/error no cambian)

    return (
        <div className="stats-container" id="stats-report-container">
            <div className="stats-header-with-button">
                <h2 className="stats-title">Estadísticas de la Comunidad de Usuarios</h2>
                {/* 4. El nuevo botón de descarga */}
                <button
                    onClick={handleDownloadPDF}
                    className="download-pdf-button"
                    disabled={isGeneratingPDF}
                >
                    {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte en PDF'}
                </button>
            </div>

            {/* Tarjetas (sin cambios) */}
            <div className="stats-grid">
                {/* ... */}
            </div>

            {/* --- Modificamos los contenedores de los gráficos para darles un ID --- */}
            {userGrowthData && (
                <div id="line-chart-container" className="chart-container-fullwidth">
                    <h3 className="chart-title">Crecimiento de Usuarios (Registros por Mes)</h3>
                    <Line data={userGrowthData} options={{ animation: false }} /> {/* Desactivar animación para captura limpia */}
                </div>
            )}

            {/* Agrupamos los gráficos de pastel en un solo contenedor para una mejor captura */}
            <div id="pie-charts-container" className="charts-section">
                {roleDistData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Rol</h3>
                        <Pie data={roleDistData} options={{ animation: false }} />
                    </div>
                )}
                {/* ... (el otro Pie chart aquí sin cambios) ... */}
            </div>

            {ageDistData && (
                <div id="bar-chart-container" className="chart-container-fullwidth">
                    <h3 className="chart-title">Distribución de Edades</h3>
                    <Bar data={ageDistData} options={{ animation: false }} />
                </div>
            )}
        </div>
    );
};

export default AdminEstadisticasUsuarios;