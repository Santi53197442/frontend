// src/components/vendedor/Checkout.js (o src/pages/vendedor/Checkout.js)
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    comprarPasaje,
    buscarClientePorCI,
    obtenerDetallesViajeConAsientos
} from '../../services/api';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { viajeId, asientoNumero } = useParams(); // Asumiendo que estos son los nombres de param en tu router.js

    const initialViajeData = location.state?.viajeData || null;
    const initialAsiento = location.state?.asientoNumero !== undefined
        ? parseInt(location.state.asientoNumero, 10)
        : parseInt(asientoNumero, 10);

    const [viajeData, setViajeData] = useState(initialViajeData);
    const [asientoSeleccionado, setAsientoSeleccionado] = useState(initialAsiento);

    const [ciClienteInput, setCiClienteInput] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [buscandoCliente, setBuscandoCliente] = useState(false);
    const [errorBusquedaCliente, setErrorBusquedaCliente] = useState(null);
    const [clienteIdParaCompra, setClienteIdParaCompra] = useState(null);
    const [clienteIdUsuarioLogueado, setClienteIdUsuarioLogueado] = useState('');

    const [loadingPago, setLoadingPago] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [errorCargaInicial, setErrorCargaInicial] = useState(null);
    const [compraError, setCompraError] = useState(null);
    const [compraExitosaInfo, setCompraExitosaInfo] = useState(null);

    // --- CAMBIO AQUÍ ---
    const userRole = localStorage.getItem('userRol'); // Leer 'userRol' en lugar de 'userRole'
    // --------------------
    const parsedUrlViajeId = parseInt(viajeId, 10);

    useEffect(() => {
        // El console.log ahora mostrará el valor de 'userRol'
        console.log("Checkout Montado - userRol from localStorage:", userRole);
        console.log("Checkout Montado - URL Params:", { viajeId, asientoNumero });
        console.log("Checkout Montado - Location State:", location.state);
        console.log("Checkout Montado - Asiento Inicial (parseado):", asientoSeleccionado);

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
                        throw new Error(`El asiento ${asientoSeleccionado} ya se encuentra ocupado.`);
                    }
                }

                // --- Lógica que usa userRole (ahora lee 'userRol') ---
                if (userRole && (userRole.toUpperCase() === 'VENDEDOR' || userRole.toUpperCase() === 'ADMINISTRADOR')) { // Comparar en mayúsculas
                    // No es necesario cargar todos los clientes aquí, solo el buscador de CI
                } else if (userRole && userRole.toUpperCase() === 'CLIENTE') {
                    const clienteLogueadoId = localStorage.getItem('userId'); // Asume que 'userId' es la clave correcta
                    if (clienteLogueadoId && !isNaN(parseInt(clienteLogueadoId, 10))) {
                        setClienteIdUsuarioLogueado(clienteLogueadoId);
                    } else {
                        setErrorCargaInicial("No se pudo identificar al usuario cliente. Por favor, inicie sesión.");
                    }
                } else if (userRole === null || userRole === '') { // Si userRol no está seteado
                    setErrorCargaInicial("Rol de usuario no definido. No se puede proceder con la compra.");
                }
                // ----------------------------------------------------
            } catch (err) {
                console.error("Checkout - Error en cargarDatosCheckout:", err);
                setErrorCargaInicial(err.message || "Error al preparar la información del checkout.");
                setViajeData(null);
            } finally {
                setLoadingInitialData(false);
            }
        };
        cargarDatosCheckout();
        // Usar los parámetros originales de la URL y userRole como dependencias
    }, [viajeId, asientoNumero, userRole]);


    const handleBuscarClientePorCi = async () => {
        // ... (sin cambios en esta función)
        if (!ciClienteInput.trim()) {
            setErrorBusquedaCliente("Por favor, ingrese una CI.");
            return;
        }
        setBuscandoCliente(true);
        setErrorBusquedaCliente(null);
        setClienteEncontrado(null);
        setClienteIdParaCompra(null);
        try {
            const response = await buscarClientePorCI(ciClienteInput.trim());
            setClienteEncontrado(response.data);
            setClienteIdParaCompra(response.data.id);
        } catch (error) {
            setClienteEncontrado(null);
            setClienteIdParaCompra(null);
            if (error.response && error.response.status === 404) {
                setErrorBusquedaCliente(`No se encontró cliente con CI: ${ciClienteInput}.`);
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

        // --- Lógica que usa userRole (ahora lee 'userRol') ---
        if (userRole && (userRole.toUpperCase() === 'VENDEDOR' || userRole.toUpperCase() === 'ADMINISTRADOR')) {
            if (!clienteIdParaCompra) {
                setCompraError("Por favor, busque y confirme un cliente por su CI.");
                return;
            }
            clienteIdFinalParaCompra = parseInt(clienteIdParaCompra, 10);
            if (isNaN(clienteIdFinalParaCompra) || clienteIdFinalParaCompra <= 0) {
                setCompraError("El ID del cliente buscado no es válido.");
                return;
            }
        } else if (userRole && userRole.toUpperCase() === 'CLIENTE') {
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
            setCompraError("Rol de usuario no reconocido para la compra. Verifique su sesión."); // Mensaje más específico
            return;
        }
        // ----------------------------------------------------

        if (!viajeData || isNaN(asientoSeleccionado)) {
            setCompraError("La información del viaje o del asiento no está completa.");
            return;
        }

        console.log("Checkout - Validaciones de compra pasadas. Procediendo...");
        setLoadingPago(true);
        setCompraError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const datosCompra = {
                viajeId: viajeData.id,
                clienteId: clienteIdFinalParaCompra,
                numeroAsiento: asientoSeleccionado,
            };
            const response = await comprarPasaje(datosCompra);
            setCompraExitosaInfo(response.data);
        } catch (err) {
            setCompraError(err.response?.data?.message || err.message || "Error al procesar la compra.");
        } finally {
            setLoadingPago(false);
        }
    };

    // --- Condición para deshabilitar el botón de pagar ---
    const isBotonPagarDisabled = loadingPago ||
        (userRole && (userRole.toUpperCase() === 'VENDEDOR' || userRole.toUpperCase() === 'ADMINISTRADOR') && !clienteIdParaCompra) ||
        (userRole && userRole.toUpperCase() === 'CLIENTE' && !clienteIdUsuarioLogueado) ||
        (!userRole); // Deshabilitar si no hay rol


    // --- Renderizado Condicional (sin cambios mayores, excepto el uso de userRole.toUpperCase()) ---
    if (loadingInitialData) return <p className="loading-mensaje">Cargando información del checkout...</p>;
    if (errorCargaInicial) return <div className="error-container-checkout"><p className="error-mensaje">{errorCargaInicial}</p><button onClick={() => navigate(`/vendedor/viaje/${viajeId}/seleccionar-asientos`)} className="btn-checkout-volver">Volver a Selección</button></div>;
    if (!viajeData || typeof viajeData.id === 'undefined' || isNaN(asientoSeleccionado)) {
        return <div className="error-container-checkout"><p className="error-mensaje">Información de viaje o asiento no válida para el checkout.</p><button onClick={() => navigate(`/vendedor/viaje/${viajeId}/seleccionar-asientos`)} className="btn-checkout-volver">Volver a Selección</button></div>;
    }

    return (
        <div className="checkout-page-container">
            {/* ... (botón volver atrás) ... */}
            <button
                onClick={() => navigate(`/vendedor/viaje/${viajeData.id}/seleccionar-asientos`, { state: { viajeData: viajeData } })}
                className="btn-checkout-volver-atras"
                disabled={loadingPago || !!compraExitosaInfo}
            >
                ← Modificar Selección de Asiento
            </button>
            <h2>Confirmación y Pago</h2>

            {/* ... (resumen del viaje) ... */}
            <div className="checkout-resumen-viaje">
                <h3>Detalles de tu Selección</h3>
                <p><strong>Viaje:</strong> {viajeData.origenNombre} → {viajeData.destinoNombre}</p>
                <p><strong>Fecha:</strong> {new Date((viajeData.fecha || '') + 'T' + (viajeData.horaSalida || '')).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                <p><strong>Asiento:</strong> <span className="checkout-asiento-num">{String(asientoSeleccionado).padStart(2, '0')}</span></p>
                <p><strong>Precio:</strong> <span className="checkout-precio-val">${viajeData.precio ? parseFloat(viajeData.precio).toFixed(2) : 'N/A'}</span></p>
            </div>


            {/* --- Sección de búsqueda por CI (usa userRole.toUpperCase()) --- */}
            {!compraExitosaInfo && userRole && (userRole.toUpperCase() === 'VENDEDOR' || userRole.toUpperCase() === 'ADMINISTRADOR') && (
                <div className="checkout-buscar-cliente">
                    {/* ... (input CI, botón buscar, info cliente encontrado) ... */}
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
            {/* ---------------------------------------------------- */}

            {compraError && <p className="error-mensaje checkout-error">{compraError}</p>}

            {/* ... (botón de pagar y confirmación de compra exitosa, usando isBotonPagarDisabled) ... */}
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