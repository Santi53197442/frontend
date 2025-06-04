// src/components/cliente/ClienteSeleccionAsientos.js
// Este componente es específico para el flujo del cliente.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados
} from '../../services/api'; // Ajusta la ruta si es necesario
// Asumiendo que quieres reutilizar el mismo CSS que el de vendedor:
import './ClienteSeleccionAsientosPage.css'; // Ajusta la ruta al CSS que quieras usar

const ClienteSeleccionAsientos = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener datos pasados por state
    const { viajeId: viajeIdFromParams } = useParams(); // viajeId de la URL

    // Intenta obtener viajeData del state pasado por el Link, sino es null
    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);

    const [loading, setLoading] = useState(true); // Inicia en true para cargar datos al montar
    const [error, setError] = useState(null);

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    const cargarDatosViajeYAsientos = useCallback(async () => {
        if (isNaN(parsedViajeId)) {
            setError("ID de Viaje inválido en la URL.");
            setLoading(false);
            return;
        }
        // Solo inicia la carga si no se está cargando ya o si no hay error previo grave
        if (!loading && error && error === "ID de Viaje inválido en la URL.") return;

        setLoading(true);
        setError(null);
        try {
            // Si no tenemos los detalles del viaje desde el state O si el ID no coincide
            if (!viajeDetalles || viajeDetalles.id !== parsedViajeId) {
                console.log(`ClienteSeleccionAsientos: Cargando detalles para viaje ID ${parsedViajeId} desde API.`);
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                setViajeDetalles(responseDetalles.data);
            } else {
                console.log(`ClienteSeleccionAsientos: Usando viajeData desde state para viaje ID ${viajeDetalles.id}.`);
            }

            const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
            setAsientosOcupados(Array.isArray(responseOcupados.data) ? responseOcupados.data : []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos del viaje o asientos.";
            console.error("ClienteSeleccionAsientos: Error en cargarDatosViajeYAsientos:", errorMessage, err.response || err);
            setError(errorMessage);
            setViajeDetalles(null); // Limpiar datos si falla
        } finally {
            setLoading(false);
        }
    }, [parsedViajeId, viajeDetalles]); // Se incluye viajeDetalles para la lógica de si ya tenemos datos

    useEffect(() => {
        cargarDatosViajeYAsientos();
    }, [cargarDatosViajeYAsientos]); // Se ejecuta cuando la función memoizada cambia (al cambiar parsedViajeId)

    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return; // No se pueden seleccionar asientos ocupados
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
        // Para el ClienteSeleccionAsientos, siempre navegamos a la ruta de checkout del cliente.
        const basePath = '/compra';

        console.log("--- ClienteSeleccionAsientos: handleIrACheckout DEBUG ---");
        console.log("Viaje ID (de URL):", parsedViajeId);
        console.log("Asiento seleccionado:", asientoSeleccionado);
        console.log("BasePath decidido (siempre /compra):", basePath);

        const targetPath = `${basePath}/viaje/${parsedViajeId}/asiento/${asientoSeleccionado}/checkout`;
        console.log("Navegando a (checkout cliente):", targetPath);

        navigate(targetPath, {
            state: {
                viajeData: viajeDetalles, // Pasar los detalles del viaje si están disponibles
                asientoNumero: asientoSeleccionado
            }
        });
    };

    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => {
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && !loading && viajeDetalles) return <p>No se pudo determinar la capacidad del ómnibus para este viaje.</p>;
        if (capacidad === 0 && loading) return <p className="loading-mensaje">Cargando mapa de asientos...</p>;
        if (capacidad === 0 && !viajeDetalles && !loading) return <p>Esperando información del viaje...</p>

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionadoPorUsuario = asientoSeleccionado === i;
            let claseAsiento = "asiento"; // Clase base
            if (estaOcupado) {
                claseAsiento += " ocupado";
            } else if (estaSeleccionadoPorUsuario) {
                claseAsiento += " seleccionado";
            } else {
                claseAsiento += " disponible"; // Para asientos libres no seleccionados
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

    // Manejo de estados de carga y error antes del return principal
    if (loading) return <div className="seleccion-asientos-container"><p className="loading-mensaje">Cargando información del viaje y asientos...</p></div>;
    if (error) return <div className="seleccion-asientos-container"><p className="error-mensaje">Error: {error} <button onClick={() => navigate('/viajes')}>Volver a Viajes</button></p></div>;
    if (!viajeDetalles && !loading) return <div className="seleccion-asientos-container"><p>No se encontraron datos para este viaje. <button onClick={() => navigate('/viajes')}>Volver a Viajes</button></p></div>;

    return (
        <div className="seleccion-asientos-container cliente-seleccion-asientos"> {/* Clase específica opcional */}
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver al Listado de Viajes
            </button>
            <h2>Selección de Asientos</h2>
            {/* Solo renderizar si viajeDetalles no es null */}
            {viajeDetalles && (
                <div className="info-viaje-seleccion">
                    <p><strong>{viajeDetalles.origenNombre} → {viajeDetalles.destinoNombre}</strong></p>
                    <p>Salida: {new Date(viajeDetalles.fechaSalida || (viajeDetalles.fecha + 'T' + viajeDetalles.horaSalida)).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p>Servicio: {viajeDetalles.omnibusMatricula || (viajeDetalles.omnibus && viajeDetalles.omnibus.matricula)}</p>
                    <p>Precio por asiento: <strong>${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : 'N/A'}</strong></p>
                </div>
            )}

            <div className="leyenda-asientos-wrapper">
                <span className="leyenda-item"><span className="asiento-ejemplo asiento disponible"></span> Libre</span>
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
                        onClick={handleIrACheckout}
                        className="btn-continuar-checkout"
                        // disabled={loading} // El 'loading' aquí se referiría al loading de esta página, no a un futuro loading de checkout
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