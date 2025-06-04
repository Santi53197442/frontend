// src/components/vendedor/SeleccionAsientos.js (o donde esté tu componente)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    obtenerDetallesViajeConAsientos,
    obtenerAsientosOcupados
} from '../../services/api'; // Asegúrate que la ruta a apiService sea correcta
import './SeleccionAsientos.css';
import { useAuth } from '../../AuthContext'; // Importa useAuth

const SeleccionAsientos = () => { // Si tu página se llama SeleccionAsientosPage, cambia el nombre aquí también
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener la ruta actual
    const { viajeId: viajeIdFromParams } = useParams(); // viajeId de la URL (ej: 123)
    const { user } = useAuth(); // Para obtener el rol del usuario

    const [viajeDetalles, setViajeDetalles] = useState(location.state?.viajeData || null);
    const [asientosOcupados, setAsientosOcupados] = useState([]);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);

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
            // Si no tenemos los detalles del viaje desde el state O si el ID no coincide con el de la URL
            // (esto puede pasar si se navega directamente a la URL sin pasar por el listado)
            if (!viajeDetalles || viajeDetalles.id !== parsedViajeId) {
                console.log(`Cargando detalles para viaje ID (URL): ${parsedViajeId}`);
                const responseDetalles = await obtenerDetallesViajeConAsientos(parsedViajeId);
                setViajeDetalles(responseDetalles.data);
            } else {
                console.log(`Usando viajeData desde state para viaje ID: ${viajeDetalles.id}`);
            }

            const responseOcupados = await obtenerAsientosOcupados(parsedViajeId);
            setAsientosOcupados(responseOcupados.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Error al cargar datos.";
            setError(errorMessage);
            setViajeDetalles(null); // Limpiar si falla la carga
        } finally {
            setLoading(false);
        }
    }, [parsedViajeId, viajeDetalles]); // Incluye viajeDetalles para re-evaluar si ya lo tenemos

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
        // Usar parsedViajeId que viene de la URL para la navegación,
        // ya que viajeDetalles.id podría no estar cargado si hubo un error o si location.state no se pasó.
        if (isNaN(parsedViajeId)) {
            alert("No hay información del ID de viaje disponible en la URL.");
            return;
        }

        let basePath = '/vendedor'; // Ruta base por defecto (para vendedores)

        // Determina la ruta base según la URL actual o el rol del usuario
        // Opción 1: Basado en si la URL actual comienza con '/compra'
        if (location.pathname.startsWith('/compra/viaje/')) {
            basePath = '/compra';
        }
        // Opción 2: (Alternativa o adicional) Basado en el rol del usuario
        // const esCliente = user && user.rol && user.rol.toLowerCase() === 'cliente';
        // if (esCliente) {
        //    // Si es cliente, siempre usa la ruta de compra, independientemente de cómo llegó aquí.
        //    // Esto puede ser más robusto si hay varias formas de llegar a esta página como cliente.
        //    basePath = '/compra';
        // }


        // Navegar a la página de checkout
        navigate(`${basePath}/viaje/${parsedViajeId}/asiento/${asientoSeleccionado}/checkout`, {
            state: {
                viajeData: viajeDetalles,       // Pasamos los detalles del viaje si los tenemos
                asientoNumero: asientoSeleccionado
            }
        });
    };

    const getCapacidadAsientos = () => {
        if (!viajeDetalles) return 0;
        return viajeDetalles.capacidadOmnibus || (viajeDetalles.omnibus && viajeDetalles.omnibus.capacidadAsientos) || 0;
    };

    const renderAsientos = () => {
        // ... (tu lógica de renderAsientos se mantiene igual) ...
        const capacidad = getCapacidadAsientos();
        if (capacidad === 0 && !loading) return <p>No se pudo determinar la capacidad del ómnibus.</p>;
        if (capacidad === 0 && loading) return <p className="loading-mensaje">Cargando mapa de asientos...</p>;

        let asientosVisuales = [];
        for (let i = 1; i <= capacidad; i++) {
            const estaOcupado = asientosOcupados.includes(i);
            const estaSeleccionadoPorUsuario = asientoSeleccionado === i;

            let claseAsiento = "asiento";
            if (estaOcupado) {
                claseAsiento += " ocupado";
            } else if (estaSeleccionadoPorUsuario) {
                claseAsiento += " seleccionado";
            }
            // Si no está ocupado ni seleccionado, es solo "asiento" (y debería ser verde por CSS)

            asientosVisuales.push(
                <button
                    key={i}
                    className={claseAsiento}
                    onClick={() => handleSeleccionarAsiento(i)}
                    disabled={estaOcupado}
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
        return filas;
    };
    // --- MANEJO DE ESTADOS DE CARGA Y ERROR ---
    if (loading) return <p className="loading-mensaje">Cargando información del viaje y asientos...</p>;
    if (error) return <p className="error-mensaje">Error: {error} <button onClick={() => navigate(-1)}>Volver</button></p>;
    // Validar que tengamos viajeDetalles después de la carga y sin errores.
    // parsedViajeId ya se valida al inicio de cargarDatosViajeYAsientos.
    if (!viajeDetalles && !loading && !error) return <p>No se encontraron datos para este viaje. <button onClick={() => navigate(-1)}>Volver</button></p>;


    return (
        <div className="seleccion-asientos-container">
            <button onClick={() => navigate(-1)} className="btn-volver-listado">
                ← Volver
            </button>
            <h2>Selección de Asientos</h2>
            {/* Asegurarse que viajeDetalles no sea null antes de acceder a sus propiedades */}
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

            {asientoSeleccionado && viajeDetalles ? ( // Asegurar que viajeDetalles exista para mostrar el precio
                <div className="resumen-seleccion-actual">
                    <h3>Asiento Seleccionado:</h3>
                    <div className="asiento-numero-grande">{asientoSeleccionado}</div>
                    <p>Cantidad: 1</p>
                    <p>Total a Pagar: ${viajeDetalles.precio ? parseFloat(viajeDetalles.precio).toFixed(2) : '0.00'}</p>
                    <button
                        onClick={handleIrACheckout}
                        className="btn-continuar-checkout"
                        disabled={loading} // loading aquí podría ser del proceso de checkout si lo implementas
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

export default SeleccionAsientos;