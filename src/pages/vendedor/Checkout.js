// src/components/vendedor/Checkout.js (o src/pages/vendedor/Checkout.js)
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    comprarPasaje,
    buscarClientePorCI, // Nueva función
    obtenerDetallesViajeConAsientos
} from '../../services/api';  // Ajusta la ruta
import './Checkout.css'; // Asegúrate que el CSS esté accesible

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Los nombres aquí deben coincidir con los de la ruta en router.js
    // Ruta: path="viaje/:viajeId/asiento/:asientoNumero/checkout"
    const { viajeId, asientoNumero } = useParams();

    const initialViajeData = location.state?.viajeData || null;
    const initialAsiento = location.state?.asientoNumero !== undefined
        ? parseInt(location.state.asientoNumero, 10)
        : parseInt(asientoNumero, 10); // Usar asientoNumero de useParams

    const [viajeData, setViajeData] = useState(initialViajeData);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(initialAsiento);

    // Para búsqueda de cliente por CI (Vendedor)
    const [ciClienteInput, setCiClienteInput] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null); // { id, nombre, apellido, ci, email }
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [errorBusquedaCliente, setErrorBusquedaCliente] = useState(null);
    const [clienteIdParaCompra, setClienteIdParaCompra] = useState(null); // ID del cliente confirmado por CI

    // Para el rol CLIENTE (si compra para sí mismo)
    const [clienteIdUsuarioLogueado, setClienteIdUsuarioLogueado] = useState('');


    const [loadingPago, setLoadingPago] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [errorCargaInicial, setErrorCargaInicial] = useState(null);
    const [compraError, setCompraError] = useState(null);
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null);

    const userRole = localStorage.getItem('userRole');
    const parsedUrlViajeId = parseInt(viajeId, 10); // Usar viajeId de useParams

    useEffect(() => {
        console.log("Checkout Montado - URL Params:", { viajeId, asientoNumero });
        console.log("Checkout Montado - Location State:", location.state);
        console.log("Checkout Montado - Asiento Inicial (parseado):", asientoSeleccionado);
        console.log("Checkout Montado - ID Viaje Parseado de URL:", parsedUrlViajeId);

        const cargarDatosCheckout = async () => {
            setLoadingInitialData(true);
            setErrorCargaInicial(null);
            setCompraError(null);
            setCompraExitosaInfo(null);

            if (isNaN(parsedUrlViajeId) || isNaN(asientoSeleccionado)) {
                setErrorCargaInicial("Información de viaje o asiento no válida para el checkout.");
                setLoadingInitialData(false);
                return;
            }

            let currentViajeData = viajeData;

            try {
                if (!currentViajeData || currentViajeData.id !== parsedUrlViajeId) {
                    const responseDetalles = await obtenerDetallesViajeConAsientos(parsedUrlViajeId);
                    if (!responseDetalles.data || typeof responseDetalles.data.id === 'undefined') {
                        throw new Error("La API no devolvió información válida para el viaje.");
                    }
                    currentViajeData = responseDetalles.data;
                    setViajeData(currentViajeData);
                }

                if (currentViajeData && currentViajeData.capacidadOmnibus) {
                    if (asientoSeleccionado < 1 || asientoSeleccionado > currentViajeData.capacidadOmnibus) {
                        throw new Error(`El asiento ${asientoSeleccionado} no es válido para este ómnibus.`);
                    }
                    if (currentViajeData.numerosAsientoOcupados && currentViajeData.numerosAsientoOcupados.includes(asientoSeleccionado)) {
                        // Si el asiento está ocupado (aunque no debería llegar aquí si SeleccionAsientosPage lo filtró)
                        // Podría pasar si el estado se vuelve inconsistente o hay una carrera.
                        throw new Error(`El asiento ${asientoSeleccionado} ya se encuentra ocupado.`);
                    }
                }

                if (userRole === 'CLIENTE') {
                    const clienteLogueadoId = localStorage.getItem('userId');
                    if (clienteLogueadoId && !isNaN(parseInt(clienteLogueadoId, 10))) {
                        setClienteIdUsuarioLogueado(clienteLogueadoId); // Guardar para usar en la compra
                    } else {
                        setErrorCargaInicial("No se pudo identificar al usuario cliente. Por favor, inicie sesión.");
                    }
                }
                // No cargamos la lista de todos los clientes para el vendedor aquí,
                // se hará bajo demanda con la búsqueda por CI.
            } catch (err) {
                console.error("Checkout - Error en cargarDatosCheckout:", err);
                setErrorCargaInicial(err.message || "Error al preparar la información del checkout.");
                setViajeData(null);
            } finally {
                setLoadingInitialData(false);
            }
        };
        cargarDatosCheckout();
    }, [viajeId, asientoNumero, userRole]); // Depender de los params de URL y userRole


    const handleBuscarClientePorCi = async () => {
        if (!ciClienteInput.trim()) {
            setErrorBusquedaCliente("Por favor, ingrese una CI.");
            return;
        }
        setBuscandoCliente(true);
        setErrorBusquedaCliente(null);
        setClienteEncontrado(null);
        setClienteIdParaCompra(null); // Resetear antes de nueva búsqueda
        try {
            const response = await buscarClientePorCI(ciClienteInput.trim());
            setClienteEncontrado(response.data);
            setClienteIdParaCompra(response.data.id); // Establecer el ID para la compra
        } catch (error) {
            setClienteEncontrado(null);
            setClienteIdParaCompra(null);
            if (error.response && error.response.status === 404) {
                setErrorBusquedaCliente(`No se encontró cliente con CI: ${ciClienteInput}. ¿Desea registrarlo?`); // Placeholder
            } else {
                setErrorBusquedaCliente(error.response?.data?.message || error.message || "Error al buscar cliente.");
            }
        } finally {
            setBuscandoCliente(false);
        }
    };


    const handleConfirmarYComprar = async () => {
        console.log("Checkout - handleConfirmarYComprar INVOCADO");
        let clienteIdFinalParaCompra;

        if (userRole === 'VENDEDOR' || userRole === 'ADMIN') {
            if (!clienteIdParaCompra) {
                setCompraError("Por favor, busque y confirme un cliente por su CI.");
                return;
            }
            clienteIdFinalParaCompra = parseInt(clienteIdParaCompra, 10);
            if (isNaN(clienteIdFinalParaCompra) || clienteIdFinalParaCompra <= 0) {
                setCompraError("El ID del cliente buscado no es válido.");
                return;
            }
        } else if (userRole === 'CLIENTE') {
            if (!clienteIdUsuarioLogueado) {
                setCompraError("No se pudo identificar al usuario cliente para la compra.");
                return;
            }
            clienteIdFinalParaCompra = parseInt(clienteIdUsuarioLogueado, 10);
            if (isNaN(clienteIdFinalParaCompra) || clienteIdFinalParaCompra <= 0) {
                setCompraError("El ID del usuario cliente no es válido.");
                return;
            }
        } else {
            setCompraError("Rol de usuario no reconocido para la compra.");
            return;
        }

        if (!viajeData || isNaN(asientoSeleccionado)) {
            setCompraError("La información del viaje o del asiento no está completa.");
            return;
        }

        console.log("Checkout - Validaciones de compra pasadas. Procediendo...");
        setLoadingPago(true);
        setCompraError(null);
        try {
            console.log("Simulando proceso de pago...");
            await new Promise(resolve => setTimeout(resolve, 1500));

            const datosCompra = {
                viajeId: viajeData.id,
                clienteId: clienteIdFinalParaCompra,
                numeroAsiento: asientoSeleccionado,
            };
            console.log("Enviando a comprarPasaje API:", datosCompra);
            const response = await comprarPasaje(datosCompra);
            console.log("Respuesta de comprarPasaje API:", response.data);
            setCompraExitosaInfo(response.data);
        } catch (err) {
            console.error("Checkout - Error durante la compra API:", err);
            setCompraError(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setLoadingPago(false);
        }
    };

    const isBotonPagarDisabled = loadingPago ||
        ((userRole === 'VENDEDOR' || userRole === 'ADMIN') && !clienteIdParaCompra) ||
        ((userRole === 'CLIENTE') && !clienteIdUsuarioLogueado);


    if (loadingInitialData) return <p className="loading-mensaje">Cargando información del checkout...</p>;
    if (errorCargaInicial) return <div className="error-container-checkout"><p className="error-mensaje">{errorCargaInicial}</p><button onClick={() => navigate(`/vendedor/viaje/${viajeId}/seleccionar-asientos`)} className="btn-checkout-volver">Volver a Selección</button></div>;
    if (!viajeData || typeof viajeData.id === 'undefined' || isNaN(asientoSeleccionado)) {
        return <div className="error-container-checkout"><p className="error-mensaje">Información de viaje o asiento no válida para el checkout.</p><button onClick={() => navigate(`/vendedor/viaje/${viajeId}/seleccionar-asientos`)} className="btn-checkout-volver">Volver a Selección</button></div>;
    }

    return (
        <div className="checkout-page-container">
            <button
                onClick={() => navigate(`/vendedor/viaje/${viajeData.id}/seleccionar-asientos`, { state: { viajeData: viajeData } })}
                className="btn-checkout-volver-atras"
                disabled={loadingPago || !!compraExitosaInfo}
            >
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

            <div className="checkout-resumen-viaje">
                <h3>Detalles de tu Selección</h3>
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date((viajeData.fecha || '') + 'T' + (viajeData.horaSalida || '')).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(asientoSeleccionado).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
            </div>

            {!compraExitosaInfo && (userRole === 'VENDEDOR' || userRole === 'ADMIN') && (
                <div className="checkout-buscar-cliente">
                    <label htmlFor="ci-cliente">CI del Cliente para este Pasaje:</label>
                    <div className="input-group-ci">
                        <input
                            type="text"
                            id="ci-cliente"
                            value={ciClienteInput}
                            onChange={(e) => {
                                setCiClienteInput(e.target.value);
                                setErrorBusquedaCliente(null);
                                setClienteEncontrado(null);
                                setClienteIdParaCompra(null);
                            }}
                            placeholder="Ingrese CI sin puntos ni guiones"
                            disabled={buscandoCliente || loadingPago}
                        />
                        <button onClick={handleBuscarClientePorCi} disabled={buscandoCliente || loadingPago || !ciClienteInput.trim()}>
                            {buscandoCliente ? 'Buscando...' : 'Buscar Cliente'}
                        </button>
                    </div>
                    {errorBusquedaCliente && <p className="error-mensaje input-error">{errorBusquedaCliente}</p>}
                    {clienteEncontrado && (
                        <div className="info-cliente-encontrado">
                            <p><strong>Cliente Encontrado:</strong></p>
                            <p>Nombre: {clienteEncontrado.nombre} {clienteEncontrado.apellido}</p>
                            <p>CI: {clienteEncontrado.ci} / Email: {clienteEncontrado.email}</p>
                            <p className="cliente-confirmado-mensaje">✔ Cliente listo para la compra (ID: {clienteEncontrado.id}).</p>
                        </div>
                    )}
                </div>
            )}

            {compraError && <p className="error-mensaje checkout-error">{compraError}</p>}

            {!compraExitosaInfo ? (
                <div className="checkout-acciones">
                    <p className="checkout-aviso-pago">Verifique los datos antes de confirmar (pago simulado).</p>
                    <button
                        onClick={handleConfirmarYComprar}
                        className="btn-checkout-pagar"
                        disabled={isBotonPagarDisabled}
                    >
                        {loadingPago ? 'Procesando...' : `Confirmar y Pagar $${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}`}
                    </button>
                </div>
            ) : (
                <div className="checkout-confirmacion-exitosa">
                    <h4>¡Compra Realizada con Éxito!</h4>
                    <p><strong>ID del Pasaje:</strong> {compraExitosaInfo.id}</p>
                    <p><strong>Cliente:</strong> {compraExitosaInfo.clienteNombre} (CI: {clienteEncontrado?.ci || 'N/A'})</p>
                    <p><strong>Viaje:</strong> {compraExitosaInfo.origenViaje} → {compraExitosaInfo.destinoViaje}</p>
                    <p><strong>Fecha:</strong> {new Date(compraExitosaInfo.fechaViaje + 'T' + compraExitosaInfo.horaSalidaViaje).toLocaleString()}</p>
                    <p><strong>Asiento:</strong> {String(compraExitosaInfo.numeroAsiento).padStart(2, '0')}</p>
                    <p><strong>Monto Pagado:</strong> ${parseFloat(compraExitosaInfo.precio).toFixed(2)}</p>
                    <div className="checkout-acciones-post">
                        <button onClick={() => navigate('/vendedor/listar-viajes-compra')}>Buscar Otro Viaje</button>
                        <button onClick={() => navigate(`/vendedor/viaje/${viajeData.id}/seleccionar-asientos`)}>Comprar Otro Asiento (Mismo Viaje)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;