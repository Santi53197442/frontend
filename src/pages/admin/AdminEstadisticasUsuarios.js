// src/pages/admin/AdminEstadisticasUsuarios.js

// Importaciones de React y servicios
import React, { useState, useEffect } from 'react';
import { obtenerEstadisticasUsuarios } from '../../services/api';

// Importaciones para la generación de PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importaciones para los gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Importación de estilos
import './AdminEstadisticasUsuarios.css';

// Registro de los componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

// Función auxiliar para calcular la edad
const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const AdminEstadisticasUsuarios = () => {
    // Estados para los datos de las estadísticas
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleDistData, setRoleDistData] = useState(null);
    const [clientTypeData, setClientTypeData] = useState(null);
    const [userGrowthData, setUserGrowthData] = useState(null);
    const [ageDistData, setAgeDistData] = useState(null);

    // Estado para el feedback de la generación del PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const response = await obtenerEstadisticasUsuarios();
                const usuarios = response.data;

                if (usuarios && usuarios.length > 0) {
                    const totalAdmins = usuarios.filter(u => u.rol === 'ADMINISTRADOR').length;
                    const totalVendedores = usuarios.filter(u => u.rol === 'VENDEDOR').length;
                    const totalClientes = usuarios.filter(u => u.rol === 'CLIENTE').length;
                    setStats({ totalUsuarios: usuarios.length, totalAdmins, totalVendedores, totalClientes });
                    setRoleDistData({ labels: ['Clientes', 'Vendedores', 'Administradores'], datasets: [{ data: [totalClientes, totalVendedores, totalAdmins], backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'] }] });

                    const clientes = usuarios.filter(u => u.rol === 'CLIENTE');
                    const clientTypeCounts = clientes.reduce((acc, c) => { if(c.tipoCliente) acc[c.tipoCliente] = (acc[c.tipoCliente] || 0) + 1; return acc; }, {});
                    setClientTypeData({ labels: Object.keys(clientTypeCounts), datasets: [{ data: Object.values(clientTypeCounts), backgroundColor: ['#4BC0C0', '#9966FF'] }] });

                    const monthlySignups = Array(12).fill(0);
                    usuarios.forEach(u => { if(u.fechaCreacion) { const month = new Date(u.fechaCreacion).getMonth(); monthlySignups[month]++; } });
                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    setUserGrowthData({ labels: monthNames, datasets: [{ label: 'Nuevos Registros por Mes', data: monthlySignups, borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', fill: true, tension: 0.1 }] });

                    const ageBrackets = { 'Menores de 18': 0, '18-25': 0, '26-35': 0, '36-45': 0, '46-60': 0, 'Mayores de 60': 0 };
                    usuarios.forEach(u => {
                        const age = calculateAge(u.fechaNac);
                        if (age !== null) {
                            if (age < 18) ageBrackets['Menores de 18']++;
                            else if (age <= 25) ageBrackets['18-25']++;
                            else if (age <= 35) ageBrackets['26-35']++;
                            else if (age <= 45) ageBrackets['36-45']++;
                            else if (age <= 60) ageBrackets['46-60']++;
                            else ageBrackets['Mayores de 60']++;
                        }
                    });
                    setAgeDistData({ labels: Object.keys(ageBrackets), datasets: [{ label: 'Cantidad de Usuarios por Edad', data: Object.values(ageBrackets), backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 }] });
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

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);

        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;

        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Reporte de Estadísticas de Usuarios', 105, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
        yPosition += 15;

        pdf.setFontSize(16);
        pdf.text('Resumen General', 15, yPosition);
        yPosition += 8;
        pdf.setFontSize(12);
        if (stats) {
            pdf.text(`- Usuarios Totales: ${stats.totalUsuarios}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Clientes: ${stats.totalClientes}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Vendedores: ${stats.totalVendedores}`, 20, yPosition); yPosition += 7;
            pdf.text(`- Administradores: ${stats.totalAdmins}`, 20, yPosition); yPosition += 5;
        }

        const addBlockToPDF = async (elementSelector) => {
            const element = document.querySelector(elementSelector);
            if (element) {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff', // Fondo blanco explícito para evitar transparencias
                });
                const imgData = canvas.toDataURL('image/png');

                const pdfWidth = 180;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                if (yPosition + pdfHeight > 280) {
                    pdf.addPage();
                    yPosition = 20;
                }

                // No añadimos el título con pdf.text(), ya está en la imagen
                pdf.addImage(imgData, 'PNG', 15, yPosition, pdfWidth, pdfHeight);
                yPosition += pdfHeight + 10;
            }
        };

        await addBlockToPDF('#line-chart-container');
        await addBlockToPDF('#pie-charts-container');
        await addBlockToPDF('#bar-chart-container');

        pdf.save('reporte-estadisticas-usuarios.pdf');
        setIsGeneratingPDF(false);
    };

    if (loading) return <div className="stats-container-loading">Cargando estadísticas de usuarios...</div>;
    if (error) return <div className="stats-container-error">{error}</div>;
    if (!stats) return <div className="stats-container">No hay datos de usuarios para mostrar.</div>;

    return (
        <div className="stats-container">
            <div className="stats-header-with-button">
                <h2 className="stats-title">Estadísticas de la Comunidad de Usuarios</h2>
                <button
                    onClick={handleDownloadPDF}
                    className="download-pdf-button"
                    disabled={isGeneratingPDF || loading}
                >
                    {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte en PDF'}
                </button>
            </div>

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
                <div id="line-chart-container" className="chart-container-fullwidth">
                    <h3 className="chart-title">Crecimiento de Usuarios (Registros por Mes)</h3>
                    <Line data={userGrowthData} options={{ animation: false, responsive: true }} />
                </div>
            )}

            <div id="pie-charts-container" className="charts-section">
                {roleDistData && (
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Rol</h3>
                        <Pie data={roleDistData} options={{ animation: false, responsive: true }} />
                    </div>
                )}
                {clientTypeData && clientTypeData.labels.length > 0 && (
                    <div className="chart-container">
                        <h3 className="chart-title">Tipos de Cliente</h3>
                        <Pie data={clientTypeData} options={{ animation: false, responsive: true }} />
                    </div>
                )}
            </div>

            {ageDistData && (
                <div id="bar-chart-container" className="chart-container-fullwidth">
                    <h3 className="chart-title">Distribución de Edades</h3>
                    <Bar data={ageDistData} options={{ animation: false, responsive: true }} />
                </div>
            )}
        </div>
    );
};

export default AdminEstadisticasUsuarios;