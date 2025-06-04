// src/components/cliente/ClienteSeleccionAsientos.js (NUEVO ARCHIVO)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados
} from '../../services/api'; // Ajusta la ruta si es necesario
import './SeleccionAsientos.css'; // Puedes reutilizar el CSS o crear uno específico
// No necesitas useAuth aquí si este componente es SOLO para clientes y siempre navega a la ruta de cliente

const ClienteSeleccionAsientos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId: viajeIdFromParams } = useParams();

    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    // ... (cargarDatosViajeYAsientos, useEffect, handleSeleccionarAsiento, getCapacidadAsientos, renderAsientos se mantienen IGUALES) ...
    // COPIA ESAS FUNCIONES DE TU SeleccionAsientos.js ORIGINAL

    const cargarDatosViajeYAsientos = useCallback(async () => {
        if (isNaN(parsedViajeId)) {
            setError("ID de Viaje inválido.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (!viajeDetalles || viajeDetalles.id !== parsedViajeId) {
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                setViajeDetalles(responseDetalles.data);
            } else {
                // Usar datos del state si ya existen y coinciden
            }
            const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
            setAsientosOcupados(responseOcupados.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos.";
            setError(errorMessage);
            setViajeDetalles(null);
        } finally {
            setLoading(false);
        }
    }, [parsedViajeId, viajeDetalles]);

    useEffect(() => {
        cargarDatosViajeYAsientos();
    }, [cargarDatosViajeYAsientos]);

    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return;
        setAsientoSeleccionado(prevSeleccionado => prevSeleccionado === numeroAsiento ? null : numeroAsiento);
    };


    const handleIrACheckout = () => {
        if (!asientoSeleccionado) {
            alert("Por favor, seleccione un asiento para continuar.");
            return;
        }
        if (isNaN(parsedViajeId)) {
            alert("No hay información del ID de viaje disponible en la URL.");
            return;
        }

        // Como este componente es para CLIENTES, siempre navegamos a la ruta de checkout de cliente
        const basePath = '/compra'; // Siempre /compra para este componente

        console.log("--- ClienteSeleccionAsientos: handleIrACheckout DEBUG ---");
        console.log("Viaje ID de URL:", parsedViajeId);
        console.log("Asiento seleccionado:", asientoSeleccionado);
        console.log("BasePath decidido:", basePath);

        const targetPath = `${basePath}/viaje/${parsedViajeId}/asiento/${asientoSeleccionado}/checkout`;
        console.log("Navegando a (checkout cliente):", targetPath);

        navigate(targetPath, {
            state: {
                viajeData: viajeDetalles,
                asientoNumero: asientoSeleccionado
            }
        });
    };

    const getCapacidadAsientos = () => { // COPIAR DE TU SeleccionAsientos.js
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => { // COPIAR DE TU SeleccionAsientos.js
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && !loading) return <p>No se pudo determinar la capacidad del ómnibus.</p>;
        if (capacidad === 0 && loading) return <p className="loading-mensaje">Cargando mapa de asientos...</p>;
        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionadoPorUsuario = asientoSeleccionado === i;
            let claseAsiento = "asiento";
            if (estaOcupado) claseAsiento += " ocupado";
            else if (estaSeleccionadoPorUsuario) claseAsiento += " seleccionado";
            asientosVisuales.push(
                <button key={i} className={claseAsiento} onClick={() => handleSeleccionarAsiento(i)} disabled={estaOcupado}>
                    {i}
                </button>
            );
        }
        const filas = [];
        for (let i = 0; i < asientosVisuales.length; i += 4) {
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

    if (loading) return <p className="loading-mensaje">Cargando información del viaje y asientos...</p>;
    if (error) return <p className="error-mensaje">Error: {error} <button onClick={() => navigate(-1)}>Volver</button></p>;
    if (!viajeDetalles && !loading && !error) return <p>No se encontraron datos para este viaje. <button onClick={() => navigate(-1)}>Volver</button></p>;

    return (
        // COPIA EL JSX de tu SeleccionAsientos.js aquí
        // Asegúrate de que el botón "Continuar y Pagar" llame a ESTE handleIrACheckout
        <div className="seleccion-asientos-container cliente-seleccion-asientos"> {/* Puedes añadir una clase específica */}
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver
            </button>
            <h2>Selección de Asientos</h2>
            {viajeDetalles && (
                <div className="info-viaje-seleccion">
                    <p><strong>{viajeDetalles.origenNombre} → {viajeDetalles.destinoNombre}</strong></p>
                    <p>Salida: {new Date(viajeDetalles.fechaSalida || (viajeDetalles.fecha + 'T' + viajeDetalles.horaSalida)).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p>Servicio: {viajeDetalles.omnibusMatricula || (viajeDetalles.omnibus && viajeDetalles.omnibus.matricula)}</p>
                    <p>Precio por asiento: <strong>${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : 'N/A'}</strong></p>
                </div>
            )}
            <div className="leyenda-asientos-wrapper">
                <span className="leyenda-item"><span className="asiento-ejemplo asiento"></span> Libre</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento ocupado"></span> Ocupado</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento seleccionado"></span> Seleccionado</span>
            </div>
            <div className="mapa-asientos-render">
                <div className="frente-omnibus-barra">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()}
            </div>
            {asientoSeleccionado && viajeDetalles ? (
                <div className="resumen-seleccion-actual">
                    <h3>Asiento Seleccionado:</h3>
                    <div className="asiento-numero-grande">{asientoSeleccionado}</div>
                    <p>Cantidad: 1</p>
                    <p>Total a Pagar: ${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : '0.00'}</p>
                    <button
                        onClick={handleIrACheckout} // Llama al handleIrACheckout de este componente
                        className="btn-continuar-checkout"
                        disabled={loading}
                    >
                        Continuar y Pagar
                    </button>
                </div>
            ) : (
                <p className="mensaje-seleccionar-asiento">Por favor, elija un asiento del mapa.</p>
            )}
        </div>
    );
};

export default ClienteSeleccionAsientos;