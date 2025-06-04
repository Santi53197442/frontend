// src/components/vendedor/SeleccionAsientos.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados
} from '../../services/api'; // Ajusta la ruta a tu apiService.js
import './SeleccionAsientos.css'; // Asegúrate de tener este archivo CSS

const SeleccionAsientos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId: viajeIdFromParams } = useParams(); // 'viajeId' debe coincidir con tu ruta

    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null); // Inicia en null

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    const cargarDatosViajeYAsientos = useCallback(async () => {
        if (isNaN(parsedViajeId)) {
            setError("ID de Viaje inválido.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Si no tenemos los detalles del viaje desde el state, o el ID no coincide, los cargamos.
            if (!viajeDetalles || viajeDetalles.id !== parsedViajeId) {
                console.log(`Cargando detalles para viaje ID: ${parsedViajeId}`);
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                setViajeDetalles(responseDetalles.data); // Asume que response.data es ViajeDetalleConAsientosDTO
            } else {
                console.log(`Usando viajeData desde state para viaje ID: ${parsedViajeId}`);
            }

            const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
            setAsientosOcupados(responseOcupados.data || []);
        } catch (err) {
            console.error("Error al cargar datos del viaje o asientos:", err);
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos.";
            setError(errorMessage);
            setViajeDetalles(null); // Limpiar si falla la carga crítica
        } finally {
            setLoading(false);
        }
    }, [parsedViajeId, viajeDetalles]); // Dependencia en viajeDetalles para re-evaluar si ya lo tenemos

    useEffect(() => {
        cargarDatosViajeYAsientos();
    }, [cargarDatosViajeYAsientos]);


    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return; // No seleccionar ocupados
        // Si el asiento clickeado es el ya seleccionado, lo des-selecciona (null). Sino, lo selecciona.
        setAsientoSeleccionado(prevSeleccionado => prevSeleccionado === numeroAsiento ? null : numeroAsiento);
    };

    const handleIrACheckout = () => {
        if (!asientoSeleccionado) {
            alert("Por favor, seleccione un asiento para continuar.");
            return;
        }
        if (!viajeDetalles || !viajeDetalles.id) {
            alert("No hay información del viaje disponible.");
            return;
        }
        // Navegar a la página de checkout, pasando la información necesaria
        // El nombre del parámetro en la ruta para asientoNumero debe ser :asientoNumero
        navigate(`/vendedor/viaje/${viajeDetalles.id}/asiento/${asientoSeleccionado}/checkout`, {
            state: {
                viajeData: viajeDetalles,       // El objeto ViajeDetalleConAsientosDTO completo
                asientoNumero: asientoSeleccionado // El número de asiento seleccionado
            }
        });
    };

    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        // Tu ViajeDetalleConAsientosDTO debe tener 'capacidadOmnibus' o 'omnibus.capacidadAsientos'
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => {
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && !loading) return <p>No se pudo determinar la capacidad del ómnibus.</p>;
        if (capacidad === 0 && loading) return <p className="loading-mensaje">Cargando mapa de asientos...</p>;

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionado = asientoSeleccionado === i; // Compara con el estado
            let claseAsiento = "asiento";
            if (estaOcupado) claseAsiento += " ocupado";
            if (estaSeleccionado) claseAsiento += " seleccionado";

            asientosVisuales.push(
                <button
                    key={i}
                    className={claseAsiento}
                    onClick={() => handleSeleccionarAsiento(i)} // Pasa el número de asiento correcto
                    disabled={estaOcupado}
                >
                    {i}
                </button>
            );
        }
        const filas = [];
        for (let i = 0; i < asientosVisuales.length; i += 4) { // Asumiendo diseño 2-pasillo-2
            filas.push(
                <div key={`fila-${i/4}`} className="fila-asientos">
                    {asientosVisuales.slice(i, i + 2)}
                    <div className="pasillo"></div>
                    {asientosVisuales.slice(i + 2, i + 4)}
                </div>
            );
        }
        return filas;
    };

    if (loading && !viajeDetalles) return <p className="loading-mensaje">Cargando detalles del viaje...</p>;
    if (error) return <p className="error-mensaje">Error: {error} <button onClick={() => navigate(-1)}>Volver</button></p>;
    if (!viajeDetalles && !loading) return <p>No se encontraron datos para este viaje. <button onClick={() => navigate(-1)}>Volver</button></p>;

    return (
        <div className="seleccion-asientos-container">
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver al Listado
            </button>
            <h2>Selección de Asientos</h2>
            <div className="info-viaje-seleccion">
                <p><strong>{viajeDetalles.origenNombre} → {viajeDetalles.destinoNombre}</strong></p>
                <p>Salida: {new Date(viajeDetalles.fechaSalida || (viajeDetalles.fecha + 'T' + viajeDetalles.horaSalida)).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p>Servicio: {viajeDetalles.omnibusMatricula || (viajeDetalles.omnibus && viajeDetalles.omnibus.matricula)}</p>
                <p>Precio por asiento: <strong>${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : 'N/A'}</strong></p>
            </div>

            <div className="leyenda-asientos-wrapper">
                <span className="leyenda-item"><span className="asiento-ejemplo disponible"></span> Libre</span>
                <span className="leyenda-item"><span className="asiento-ejemplo ocupado"></span> Ocupado</span>
                <span className="leyenda-item"><span className="asiento-ejemplo seleccionado"></span> Seleccionado</span>
            </div>

            <div className="mapa-asientos-render">
                <div className="frente-omnibus-barra">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()}
            </div>

            {asientoSeleccionado ? (
                <div className="resumen-seleccion-actual">
                    <h3>Asiento Seleccionado:</h3>
                    <div className="asiento-numero-grande">{asientoSeleccionado}</div> {/* Muestra el asiento del estado */}
                    <p>Cantidad: 1</p>
                    <p>Total a Pagar: ${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : '0.00'}</p>
                    <button
                        onClick={handleIrACheckout}
                        className="btn-continuar-checkout"
                        disabled={loading}
                    >
                        Continuar y Pagar
                    </button>
                </div>
            ) : (
                <p className="mensaje-seleccionar-asiento">Por favor, seleccione un asiento del mapa.</p>
            )}
        </div>
    );
};

export default SeleccionAsientos;