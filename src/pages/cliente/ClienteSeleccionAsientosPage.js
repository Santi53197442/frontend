// src/components/cliente/ClienteSeleccionAsientos.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados
} from '../../services/api';
import '../../pages/vendedor/SeleccionAsientos.css'; // Ajusta la ruta si es diferente

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

    const cargarDatosViajeYAsientos = useCallback(async () => {
        if (isNaN(parsedViajeId)) {
            setError("ID de Viaje inválido en la URL.");
            setLoading(false);
            return;
        }
        // No resetear el error si ya estamos cargando para evitar loop si el error persiste
        if(!loading) setError(null); // Resetear error solo si no estamos ya en una carga
        setLoading(true);

        try {
            let currentViajeDetalles = viajeDetalles;
            if (!currentViajeDetalles || currentViajeDetalles.id !== parsedViajeId) {
                console.log(`ClienteSeleccionAsientos: Cargando detalles para viaje ID ${parsedViajeId} desde API.`);
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                currentViajeDetalles = responseDetalles.data; // Guardar en variable local primero
                setViajeDetalles(currentViajeDetalles);
            } else {
                console.log(`ClienteSeleccionAsientos: Usando viajeData desde state para viaje ID ${currentViajeDetalles.id}.`);
            }

            // Solo intentar cargar asientos ocupados si tenemos detalles del viaje
            if (currentViajeDetalles) {
                const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
                setAsientosOcupados(Array.isArray(responseOcupados.data) ? responseOcupados.data : []);
            } else {
                // Si no hay detalles del viaje, no podemos obtener asientos ocupados
                setAsientosOcupados([]);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos del viaje o asientos.";
            console.error("ClienteSeleccionAsientos: Error en cargarDatosViajeYAsientos:", errorMessage, err.response || err);
            setError(errorMessage);
            setViajeDetalles(null);
            setAsientosOcupados([]);
        } finally {
            setLoading(false);
        }
    }, [parsedViajeId, viajeDetalles, loading]); // Añadido loading a dependencias para controlar el reseteo de error

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
            alert("ID de viaje inválido. No se puede continuar.");
            return;
        }
        const basePath = '/compra';
        const targetPath = `${basePath}/viaje/${parsedViajeId}/asiento/${asientoSeleccionado}/checkout`;
        navigate(targetPath, {
            state: { viajeData: viajeDetalles, asientoNumero: asientoSeleccionado }
        });
    };

    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    // --- FUNCIÓN renderAsientos MODIFICADA ---
    const renderAsientos = () => {
        // No es necesario verificar 'loading' aquí si ya lo hacemos en el return principal.
        // Ya sabemos que si llegamos aquí, loading es false y error es null.
        if (!viajeDetalles) {
            // Esto no debería pasar si la lógica de carga principal es correcta,
            // pero es una salvaguarda.
            return <p>Esperando información del viaje...</p>;
        }

        const capacidad = getCapacidadAsientos();
        console.log("ClienteSeleccionAsientos - renderAsientos - capacidad:", capacidad);


        if (capacidad === 0) {
            return <p>No se pudo determinar la capacidad del ómnibus o es 0 para este viaje.</p>;
        }

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionadoPorUsuario = asientoSeleccionado === i;
            let claseAsiento = "asiento";
            if (estaOcupado) {
                claseAsiento += " ocupado";
            } else if (estaSeleccionadoPorUsuario) {
                claseAsiento += " seleccionado";
            } else {
                claseAsiento += " disponible";
            }
            asientosVisuales.push(
                <button
                    key={i}
                    className={claseAsiento}
                    onClick={() => handleSeleccionarAsiento(i)}
                    disabled={estaOcupado}
                    aria-label={`Asiento número ${i} ${estaOcupado ? 'ocupado' : (estaSeleccionadoPorUsuario ? 'seleccionado' : 'disponible')}`}
                >
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
        // Si 'filas' está vacío después de los bucles pero capacidad > 0, algo fue mal.
        // Pero generalmente, si capacidad > 0, filas tendrá elementos o será un array vacío (que es JSX válido).
        // Devolver null si filas está vacío es más seguro que un array vacío si hay dudas.
        return filas.length > 0 ? filas : <p>No hay asientos para mostrar según la capacidad.</p>; // O null
    };
    // --- FIN DE FUNCIÓN renderAsientos MODIFICADA ---


    // --- MANEJO DE ESTADOS DE CARGA Y ERROR PRINCIPAL (MÁS ORDENADO) ---
    if (loading) {
        return (
            <div className="seleccion-asientos-container">
                <p className="loading-mensaje">Cargando información del viaje y asientos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seleccion-asientos-container">
                <p className="error-mensaje">Error: {error} <button onClick={() => navigate('/viajes')}>Volver a Viajes</button></p>
            </div>
        );
    }

    // Si no está cargando y no hay error, pero no hay viajeDetalles, es un estado problemático.
    if (!viajeDetalles) {
        return (
            <div className="seleccion-asientos-container">
                <p>No se encontraron datos para este viaje. Esto puede ocurrir si la ID del viaje no es válida o si hubo un problema al cargar la información.</p>
                <button onClick={() => navigate('/viajes')}>Volver a Viajes</button>
            </div>
        );
    }
    // --- FIN DE MANEJO DE ESTADOS DE CARGA Y ERROR PRINCIPAL ---

    // Si llegamos aquí, tenemos viajeDetalles, no estamos cargando y no hay error.
    return (
        <div className="seleccion-asientos-container cliente-seleccion-asientos">
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver al Listado de Viajes
            </button>
            <h2>Selección de Asientos</h2>
            <div className="info-viaje-seleccion">
                <p><strong>{viajeDetalles.origenNombre} → {viajeDetalles.destinoNombre}</strong></p>
                <p>Salida: {new Date(viajeDetalles.fechaSalida || (viajeDetalles.fecha + 'T' + viajeDetalles.horaSalida)).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                <p>Servicio: {viajeDetalles.omnibusMatricula || (viajeDetalles.omnibus && viajeDetalles.omnibus.matricula)}</p>
                <p>Precio por asiento: <strong>${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : 'N/A'}</strong></p>
            </div>

            <div className="leyenda-asientos-wrapper">
                <span className="leyenda-item"><span className="asiento-ejemplo asiento disponible"></span> Libre</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento ocupado"></span> Ocupado</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento seleccionado"></span> Seleccionado</span>
            </div>

            <div className="mapa-asientos-render">
                <div className="frente-omnibus-barra">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()} {/* Llamada a la función modificada */}
            </div>

            {asientoSeleccionado && ( // Ya tenemos viajeDetalles aquí
                <div className="resumen-seleccion-actual">
                    <h3>Asiento Seleccionado:</h3>
                    <div className="asiento-numero-grande">{asientoSeleccionado}</div>
                    <p>Cantidad: 1</p>
                    <p>Total a Pagar: ${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : '0.00'}</p>
                    <button
                        onClick={handleIrACheckout}
                        className="btn-continuar-checkout"
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