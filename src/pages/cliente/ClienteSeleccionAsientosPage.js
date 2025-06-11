// src/components/cliente/ClienteSeleccionAsientos.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados,
    reservarAsientosTemporalmente
} from '../../services/api';
import './ClienteSeleccionAsientosPage.css';

const ClienteSeleccionAsientos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId: viajeIdFromParams } = useParams();
    const { user } = useAuth();

    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
    const MAX_ASIENTOS = 4;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReserving, setIsReserving] = useState(false);

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    useEffect(() => {
        const cargarDatos = async () => {
            if (isNaN(parsedViajeId)) {
                setError("ID de Viaje inválido en la URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                setViajeDetalles(responseDetalles.data);
                const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
                setAsientosOcupados(Array.isArray(responseOcupados.data) ? responseOcupados.data : []);
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar datos.");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [parsedViajeId]);

    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return;
        setAsientosSeleccionados(prev => {
            if (prev.includes(numeroAsiento)) {
                return prev.filter(a => a !== numeroAsiento);
            }
            if (prev.length >= MAX_ASIENTOS) {
                alert(`Solo puede seleccionar un máximo de ${MAX_ASIENTOS} asientos.`);
                return prev;
            }
            return [...prev, numeroAsiento];
        });
    };

    const handleIrACheckout = async () => {
    if (asientosSeleccionados.length === 0) {
        alert("Por favor, seleccione al menos un asiento.");
        return;
    }
    if (!user || !user.id) {
        alert("Error: No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.");
        return;
    }

    setIsReserving(true);
    try {
        const reservaDTO = {
            viajeId: parsedViajeId,
            clienteId: user.id,
            numerosAsiento: asientosSeleccionados,
        };

        const response = await reservarAsientosTemporalmente(reservaDTO);
        const { expiracion } = response.data;

        const asientosString = asientosSeleccionados.join(',');
        const targetPath = `/compra/viaje/${parsedViajeId}/asientos/${asientosString}/checkout`;

        navigate(targetPath, {
            state: {
                viajeData: viajeDetalles,
                asientosNumeros: asientosSeleccionados,
                reservaExpiraEn: expiracion,
            }
        });
    } catch (error) {
        // --- INICIO DE LA SECCIÓN CORREGIDA ---
        const errorMessage = error.response?.data?.message || "Ocurrió un error al procesar su solicitud.";
        
        alert(errorMessage);

        // Solo recargamos si el error indica que un asiento fue ocupado por otro usuario.
        if (errorMessage.toLowerCase().includes("no está disponible")) {
            window.location.reload();
        }
        // --- FIN DE LA SECCIÓN CORREGIDA ---
    } finally {
        setIsReserving(false);
    }
    };
    
    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => {
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && loading) return <p className="loading-mensaje">Cargando mapa de asientos...</p>;
        if (capacidad === 0 && !loading) return <p>No se pudo determinar la capacidad del ómnibus.</p>;

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionadoPorUsuario = asientosSeleccionados.includes(i);
            let claseAsiento = "asiento";
            if (estaOcupado) claseAsiento += " ocupado";
            else if (estaSeleccionadoPorUsuario) claseAsiento += " seleccionado";
            else claseAsiento += " disponible";

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

    if (loading) return <div className="seleccion-asientos-container"><p className="loading-mensaje">Cargando...</p></div>;
    if (error) return <div className="seleccion-asientos-container"><p className="error-mensaje">Error: {error}</p></div>;
    if (!viajeDetalles && !loading) return <div className="seleccion-asientos-container"><p>No se encontraron datos para este viaje.</p></div>;

    return (
        <div className="seleccion-asientos-container cliente-seleccion-asientos">
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver al Listado de Viajes
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
                <span className="leyenda-item"><span className="asiento-ejemplo asiento disponible"></span> Libre</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento ocupado"></span> Ocupado</span>
                <span className="leyenda-item"><span className="asiento-ejemplo asiento seleccionado"></span> Seleccionado</span>
            </div>
            <div className="mapa-asientos-render">
                <div className="frente-omnibus-barra">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()}
            </div>
            {asientosSeleccionados.length > 0 && viajeDetalles ? (
                <div className="resumen-seleccion-actual">
                    <h3>Asientos Seleccionados:</h3>
                    <div className="asientos-lista-grande">
                        {asientosSeleccionados.sort((a, b) => a - b).join(', ')}
                    </div>
                    <p>Cantidad: {asientosSeleccionados.length}</p>
                    <p>Total a Pagar: {`$${(parseFloat(viajeDetalles.precio) * asientosSeleccionados.length).toFixed(2)}`}</p>
                    <button
                        onClick={handleIrACheckout}
                        className="btn-continuar-checkout"
                        disabled={isReserving}
                    >
                        {isReserving ? 'Reservando...' : 'Continuar y Pagar'}
                    </button>
                </div>
            ) : (
                <p className="mensaje-seleccionar-asiento">Por favor, elija hasta {MAX_ASIENTOS} asientos del mapa.</p>
            )}
        </div>
    );
};

export default ClienteSeleccionAsientos;
