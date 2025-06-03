// src/pages/vendedor/SeleccionAsientosPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { obtenerDetallesViajeConAsientos } from '../../services/apiService'; // Correcta importación
import './SeleccionAsientosPage.css'; // Tu CSS

const SeleccionAsientosPage = () => {
    const { viajeId: viajeIdFromParams } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [viajeInfo, setViajeInfo] = useState(null); // ViajeDetalleConAsientosDTO
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [capacidadOmnibus, setCapacidadOmnibus] = useState(0);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null); // Para UN solo asiento

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const parsedViajeId = parseInt(viajeIdFromParams, 10);

    useEffect(() => {
        const fetchViajeData = async () => {
            if (isNaN(parsedViajeId)) {
                setError("ID de Viaje no proporcionado o inválido.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            setAsientoSeleccionado(null); // Resetear asiento en cada carga de viaje
            try {
                const response = await obtenerDetallesViajeConAsientos(parsedViajeId);
                const dataAPI = response.data;

                if (!dataAPI || typeof dataAPI !== 'object') {
                    throw new Error("La respuesta de la API no contiene datos válidos del viaje.");
                }
                setViajeInfo(dataAPI); // dataAPI es ViajeDetalleConAsientosDTO
                setAsientosOcupados(dataAPI.numerosAsientoOcupados || []);
                const capacidad = dataAPI.capacidadOmnibus || (dataAPI.omnibus && dataAPI.omnibus.capacidadAsientos) || 0;
                setCapacidadOmnibus(capacidad);

            } catch (err) {
                console.error("Error cargando detalles del viaje:", err);
                setError(err.response?.data?.message || err.message || "No se pudo cargar la información del viaje.");
                setViajeInfo(null); // Limpiar en caso de error
            } finally {
                setLoading(false);
            }
        };
        fetchViajeData();
    }, [parsedViajeId]);

    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return; // No se puede seleccionar un asiento ocupado

        // Si se hace clic en el asiento ya seleccionado, se deselecciona. Sino, se selecciona el nuevo.
        setAsientoSeleccionado(prev => prev === numeroAsiento ? null : numeroAsiento);
    };

    const renderAsientos = () => {
        if (!viajeInfo || capacidadOmnibus === 0) {
            return <p className="info-text">Configurando mapa de asientos...</p>;
        }
        const layout = [];
        let currentSeat = 1;
        const rows = Math.ceil(capacidadOmnibus / 4); // Asumiendo 2-pasillo-2

        for (let i = 0; i < rows; i++) {
            const rowSeats = [];
            for (let j = 0; j < 4; j++) { // Para las 4 posiciones de asiento por fila visual (2 + pasillo + 2)
                if (currentSeat <= capacidadOmnibus) {
                    const seatNumber = currentSeat;
                    const isOccupied = asientosOcupados.includes(seatNumber);
                    const isSelected = asientoSeleccionado === seatNumber;
                    let seatClass = 'asiento-btn';
                    if (isOccupied) seatClass += ' ocupado';
                    else if (isSelected) seatClass += ' seleccionado';
                    else seatClass += ' libre';

                    rowSeats.push(
                        <button
                            key={seatNumber}
                            className={seatClass}
                            onClick={() => handleSeleccionarAsiento(seatNumber)}
                            disabled={isOccupied}
                        >
                            {String(seatNumber).padStart(2, '0')}
                        </button>
                    );
                    currentSeat++;
                } else {
                    rowSeats.push(<div key={`empty-${i}-${j}`} className="asiento-btn placeholder"></div>); // Espacio vacío
                }
                if (j === 1) { // Añadir pasillo después del segundo asiento de la fila
                    rowSeats.push(<div key={`pasillo-${i}`} className="pasillo-div"></div>);
                }
            }
            layout.push(<div key={`row-${i}`} className="fila-asiento-div">{rowSeats}</div>);
        }
        return layout;
    };

    const handleContinuarCheckout = () => {
        if (!asientoSeleccionado) {
            alert("Por favor, seleccione un asiento para continuar.");
            return;
        }
        if (!viajeInfo) {
            alert("La información del viaje no está disponible.");
            return;
        }
        // Navega a la página de checkout, pasando los datos del viaje y el asiento seleccionado
        navigate(`/vendedor/viaje/${viajeInfo.id}/asiento/${asientoSeleccionado}/checkout`, {
            state: {
                viajeData: viajeInfo,           // El objeto ViajeDetalleConAsientosDTO
                asientoNumero: asientoSeleccionado // El número del asiento seleccionado
            }
        });
    };

    if (loading) return <p className="loading-mensaje">Cargando información del viaje...</p>;
    if (error) return <div className="error-container"><p className="error-mensaje">Error: {error}</p><button onClick={() => navigate('/vendedor/listar-viajes-compra')} className="btn-volver">Volver al Listado</button></div>;
    if (!viajeInfo) return <div className="error-container"><p className="error-mensaje">No se encontró información para este viaje.</p><button onClick={() => navigate('/vendedor/listar-viajes-compra')} className="btn-volver">Volver al Listado</button></div>;

    const precioTotal = asientoSeleccionado && viajeInfo.precio ? viajeInfo.precio.toFixed(2) : '0.00';

    return (
        <div className="sp-container"> {/* sp = SeleccionPasajes */}
            <button onClick={() => navigate(location.state?.from || '/vendedor/listar-viajes-compra')} className="sp-btn-volver">
                ← Volver
            </button>
            <div className="sp-info-viaje">
                <h2>Selección de Asientos</h2>
                <p><strong>{viajeInfo.origenNombre}</strong> → <strong>{viajeInfo.destinoNombre}</strong></p>
                <p>Salida: {new Date((viajeInfo.fecha || '') + 'T' + (viajeInfo.horaSalida || '')).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p>Ómnibus: {viajeInfo.omnibusMatricula || (viajeInfo.omnibus?.matricula)}</p>
                <p>Precio por asiento: <strong>${viajeInfo.precio ? parseFloat(viajeInfo.precio).toFixed(2) : 'N/A'}</strong></p>
            </div>

            <div className="sp-leyenda">
                <span className="sp-leyenda-item"><span className="sp-ejemplo sp-libre"></span> Libre</span>
                <span className="sp-leyenda-item"><span className="sp-ejemplo sp-ocupado"></span> Ocupado</span>
                <span className="sp-leyenda-item"><span className="sp-ejemplo sp-seleccionado"></span> Seleccionado</span>
            </div>

            <div className="sp-mapa-omnibus">
                <div className="sp-frente-omnibus">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()}
            </div>

            {asientoSeleccionado ? (
                <div className="sp-resumen-seleccion">
                    <h3>Asiento Seleccionado:</h3>
                    <div className="sp-asiento-elegido">{String(asientoSeleccionado).padStart(2, '0')}</div>
                    <p>Cantidad: 1</p>
                    <p><strong>Total a Pagar:</strong> ${precioTotal}</p>
                    <button onClick={handleContinuarCheckout} className="sp-btn-continuar">
                        Continuar a Checkout
                    </button>
                </div>
            ) : (
                <p className="sp-mensaje-info">Por favor, elija un asiento del mapa.</p>
            )}
        </div>
    );
};

export default SeleccionAsientosPage;