// src/pages/vendedor/SeleccionAsientosPage.js (o la ruta correcta donde lo tengas)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { obtenerDetallesViajeConAsientos } from '../../services/api'; // Asegúrate que esta función esté en tu apiService
import './SeleccionAsientosPage.css';

const SeleccionAsientosPage = () => {
    const { viajeId } = useParams(); // Obtiene el viajeId de la URL (ej: "123")
    const location = useLocation(); // Para acceder al estado pasado en la navegación
    const navigate = useNavigate();

    // Este estado almacenará la información completa del viaje,
    // priorizando los datos frescos de la API.
    const [viajeInfo, setViajeInfo] = useState(null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [capacidadOmnibus, setCapacidadOmnibus] = useState(0);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Información básica del viaje pasada desde la página anterior
    const viajeDesdeListado = location.state?.viajeData;

    useEffect(() => {
        const fetchDetallesDelViaje = async () => {
            if (!viajeId) {
                setError("ID de Viaje no especificado en la URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                console.log(`Fetching details for viajeId: ${viajeId}`);
                const response = await obtenerDetallesViajeConAsientos(viajeId);
                const dataAPI = response.data;

                // Combinamos la información: la de la API es prioritaria
                // pero si algo falta y lo teníamos del listado, lo usamos como fallback.
                setViajeInfo({
                    ...viajeDesdeListado, // Info del listado como base (puede tener campos que la API de detalle no)
                    ...dataAPI,           // Info de la API sobrescribe y añade (ej. estado actualizado, precio)
                    id: parseInt(viajeId) // Aseguramos que el ID sea el de la URL
                });
                setAsientosOcupados(dataAPI.numerosAsientoOcupados || []);
                setCapacidadOmnibus(dataAPI.capacidadOmnibus || 0);
                console.log("Detalles del viaje y asientos cargados desde API:", dataAPI);

            } catch (err) {
                console.error("Error al cargar detalles del viaje y asientos desde API:", err);
                setError(err.response?.data?.message || "Error al cargar la información de los asientos.");
                // Fallback a la información del listado si la llamada API falla pero teníamos datos previos
                if (viajeDesdeListado) {
                    setViajeInfo(viajeDesdeListado);
                    setCapacidadOmnibus(viajeDesdeListado.capacidadOmnibus || 0);
                    // Aquí no tendríamos los asientos ocupados actualizados, es un problema
                    setAsientosOcupados([]); // O mostrar un error más específico
                    console.warn("Usando información de viaje desde el listado debido a error de API.")
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetallesDelViaje();

    }, [viajeId, viajeDesdeListado]); // Dependencias viajeId y viajeDesdeListado (aunque viajeDesdeListado no debería cambiar)

    const handleSeleccionarAsiento = (numeroAsiento) => {
        if (asientosOcupados.includes(numeroAsiento)) return;

        setAsientosSeleccionados(prevSeleccionados => {
            if (prevSeleccionados.includes(numeroAsiento)) {
                return prevSeleccionados.filter(asiento => asiento !== numeroAsiento);
            } else {
                // Aquí podrías limitar el número de asientos (ej. máximo 4 por compra)
                // if (prevSeleccionados.length >= 4) {
                //     alert("Solo puedes seleccionar hasta 4 asientos.");
                //     return prevSeleccionados;
                // }
                return [...prevSeleccionados, numeroAsiento];
            }
        });
    };

    const renderAsientos = () => {
        if (loading || !viajeInfo || capacidadOmnibus === 0) {
            // Muestra un mensaje o un loader si la capacidad aún no está definida o está cargando
            return <p>Calculando disposición de asientos...</p>;
        }

        const totalAsientos = capacidadOmnibus;
        const asientosPorFilaVisual = 5; // 2 asientos, pasillo, 2 asientos
        const asientosRealesPorFila = 4; // Para el cálculo de filas
        const numeroDeFilas = Math.ceil(totalAsientos / asientosRealesPorFila);

        const layoutAsientos = [];
        let numeroAsientoActual = 1;

        for (let i = 0; i < numeroDeFilas; i++) {
            const fila = [];
            for (let j = 0; j < asientosPorFilaVisual; j++) {
                if (j === 2) { // Posición del pasillo
                    fila.push(<div key={`pasillo-${i}`} className="asiento pasillo"></div>);
                } else {
                    if (numeroAsientoActual <= totalAsientos) {
                        const esOcupado = asientosOcupados.includes(numeroAsientoActual);
                        const esSeleccionado = asientosSeleccionados.includes(numeroAsientoActual);
                        let claseAsiento = 'asiento';
                        if (esOcupado) claseAsiento += ' ocupado';
                        else if (esSeleccionado) claseAsiento += ' seleccionado';
                        else claseAsiento += ' libre';

                        // Lógica especial para el asiento WC (ejemplo si es el último)
                        // Ajusta esta lógica si el WC tiene un número específico o posición
                        if (viajeInfo.omnibusMatricula && viajeInfo.omnibusMatricula.includes("WC") && numeroAsientoActual === totalAsientos) { // Muy simplificado
                            fila.push(
                                <button key="wc" className="asiento ocupado wc" disabled>WC</button>
                            );
                        } else {
                            fila.push(
                                <button
                                    key={numeroAsientoActual}
                                    className={claseAsiento}
                                    onClick={() => handleSeleccionarAsiento(numeroAsientoActual)}
                                    disabled={esOcupado}
                                >
                                    {numeroAsientoActual < 10 ? `0${numeroAsientoActual}` : numeroAsientoActual}
                                </button>
                            );
                        }
                        numeroAsientoActual++;
                    } else {
                        // Espacio vacío si ya no hay más asientos pero se completa la grilla visual
                        fila.push(<div key={`vacio-${i}-${j}`} className="asiento vacio"></div>);
                    }
                }
            }
            layoutAsientos.push(<div key={`fila-${i}`} className="fila-asientos">{fila}</div>);
        }
        // Si el último asiento fue el WC y no se renderizó antes, y quieres que esté al final.
        // Esto es un poco más complejo de encajar perfectamente sin saber la lógica exacta del WC.
        // La imagen sugiere que WC reemplaza un asiento numerado o está al final.
        // Si WC es uno de los `totalAsientos` y está ocupado, ya se manejaría.
        // Si es un asiento "extra", la lógica de `totalAsientos` y filas debe considerarlo.

        return layoutAsientos;
    };

    const handleConfirmarCompra = () => {
        if (asientosSeleccionados.length === 0) {
            alert("Por favor, seleccione al menos un asiento.");
            return;
        }
        // Aquí iría la lógica para llamar a la API y crear los pasajes
        // const datosCompra = {
        //     viajeId: parseInt(viajeId),
        //     numerosAsiento: asientosSeleccionados,
        //     // clienteId: obtenerIdClienteAutenticado(), // O pedir datos del pasajero
        // };
        // try {
        //    const response = await comprarPasajes(datosCompra); // Necesitas crear esta función en apiService
        //    alert("¡Compra exitosa! Asientos: " + response.data.asientosComprados.join(', '));
        //    navigate('/mis-compras'); // O a donde corresponda
        // } catch (error) {
        //    alert("Error al realizar la compra: " + (error.response?.data?.message || error.message));
        // }
        alert(`Simulación de compra: Viaje ID ${viajeId}, Asientos: ${asientosSeleccionados.join(', ')}, Total: $${(viajeInfo.precio * asientosSeleccionados.length).toFixed(2)}`);
        // Temporalmente redirigir o limpiar selección
        setAsientosSeleccionados([]);
        // navigate('/ruta-confirmacion-compra');
    };

    if (loading) return <p className="loading-mensaje">Cargando información del viaje y asientos...</p>;
    if (error) return <p className="error-mensaje">Error: {error}</p>;
    // Necesitamos que viajeInfo esté cargado para mostrar la página
    if (!viajeInfo) return <p className="loading-mensaje">Esperando datos del viaje...</p>;

    return (
        <div className="seleccion-asientos-container">
            <button onClick={() => navigate(-1)} className="btn-volver">
                ← Volver al Listado
            </button>
            <div className="info-viaje-header">
                <h2>Selección de Asientos</h2>
                <p>
                    <strong>{viajeInfo.origenNombre}</strong> → <strong>{viajeInfo.destinoNombre}</strong>
                </p>
                <p>
                    <strong>Salida:</strong> {
                    // El DTO ViajeDetalleConAsientosDTO tiene fecha y horaSalida separados
                    new Date(viajeInfo.fecha + 'T' + viajeInfo.horaSalida).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
                }
                </p>
                <p><strong>Servicio:</strong> {viajeInfo.omnibusMatricula || `Viaje ID ${viajeInfo.id}`}</p>
                <p><strong>Precio por asiento:</strong> ${viajeInfo.precio ? viajeInfo.precio.toFixed(2) : 'N/A'}</p>
            </div>

            <div className="leyenda-asientos">
                <span className="leyenda-item"><span className="cuadro libre"></span> Libre</span>
                <span className="leyenda-item"><span className="cuadro ocupado"></span> Ocupado</span>
                <span className="leyenda-item"><span className="cuadro seleccionado"></span> Seleccionado</span>
            </div>

            <div className="omnibus-layout">
                <div className="cabecera-omnibus">FRENTE DEL ÓMNIBUS</div>
                {renderAsientos()}
            </div>

            {asientosSeleccionados.length > 0 && (
                <div className="resumen-compra">
                    <h3>Asientos Seleccionados:</h3>
                    <p className="asientos-elegidos-lista">{asientosSeleccionados.sort((a, b) => a - b).join(', ')}</p>
                    <p><strong>Cantidad:</strong> {asientosSeleccionados.length}</p>
                    <p><strong>Total a Pagar:</strong> ${(viajeInfo.precio * asientosSeleccionados.length).toFixed(2)}</p>
                    <button onClick={handleConfirmarCompra} className="btn-confirmar-compra">
                        Confirmar y Pagar
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeleccionAsientosPage;