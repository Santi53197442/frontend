// src/pages/vendedor/VendedorListadoPasajesViaje.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerPasajesDeViajeParaVendedor } from '../../services/api'; // Ajusta la ruta si es necesario
// import './VendedorListadoPasajesViaje.css'; // Crea este archivo CSS

const VendedorListadoPasajesViaje = () => {
    const { viajeId } = useParams();
    const [pasajes, setPasajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nombreViaje, setNombreViaje] = useState(''); // Para mostrar el nombre del viaje

    // Ejemplo de estado para filtros (puedes expandir esto)
    const [filtros, setFiltros] = useState({
        clienteNombre: '',
        numeroAsiento: '',
        // estadoPasaje: '', // Si decides reactivarlo
        sortBy: 'numeroAsiento',
        sortDir: 'asc'
    });

    useEffect(() => {
        const fetchPasajes = async () => {
            if (!viajeId) return;
            setLoading(true);
            setError(null);
            try {
                const params = {};
                if (filtros.clienteNombre) params.clienteNombre = filtros.clienteNombre;
                if (filtros.numeroAsiento) params.numeroAsiento = filtros.numeroAsiento;
                // if (filtros.estadoPasaje) params.estadoPasaje = filtros.estadoPasaje;
                if (filtros.sortBy) params.sortBy = filtros.sortBy;
                if (filtros.sortDir) params.sortDir = filtros.sortDir;

                const response = await obtenerPasajesDeViajeParaVendedor(viajeId, params);
                setPasajes(response.data || []);
                // Aquí podrías obtener el nombre del viaje si el DTO del pasaje lo incluye o hacer otra llamada
                if (response.data && response.data.length > 0) {
                    // Asumiendo que el primer pasaje tiene la info del viaje, o podrías tenerla de otra fuente
                    setNombreViaje(`Viaje de ${response.data[0].origenViaje} a ${response.data[0].destinoViaje} el ${new Date(response.data[0].fechaViaje).toLocaleDateString()}`);
                } else {
                    setNombreViaje(`Viaje ID: ${viajeId}`);
                }

            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar los pasajes del viaje.");
                setPasajes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPasajes();
    }, [viajeId, filtros]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    // Lógica para botones de ordenamiento, similar a ClienteListarPasajes
    const handleSortChange = (newSortBy) => {
        setFiltros(prevFiltros => {
            const newSortDir = prevFiltros.sortBy === newSortBy && prevFiltros.sortDir === 'asc' ? 'desc' : 'asc';
            return { ...prevFiltros, sortBy: newSortBy, sortDir: newSortDir };
        });
    };

    const getSortIndicator = (columnName) => {
        if (filtros.sortBy === columnName) {
            return filtros.sortDir === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };


    if (loading) return <p>Cargando pasajes del viaje...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div className="vendedor-listado-pasajes-container"> {/* Usa una clase específica */}
            <h2>Pasajes Vendidos para {nombreViaje}</h2>

            {/* Formulario de Filtros */}
            <form className="filtros-form-inline" onSubmit={(e) => e.preventDefault()}> {/* Evita submit por ahora */}
                <div className="filtro-item">
                    <label htmlFor="clienteNombre">Nombre Cliente:</label>
                    <input
                        type="text"
                        id="clienteNombre"
                        name="clienteNombre"
                        value={filtros.clienteNombre}
                        onChange={handleFiltroChange}
                        placeholder="Buscar por nombre"
                    />
                </div>
                <div className="filtro-item">
                    <label htmlFor="numeroAsiento">N° Asiento:</label>
                    <input
                        type="number"
                        id="numeroAsiento"
                        name="numeroAsiento"
                        value={filtros.numeroAsiento}
                        onChange={handleFiltroChange}
                        placeholder="Buscar asiento"
                    />
                </div>
                {/* <button type="submit">Aplicar Filtros</button> */} {/* Opcional si los filtros se aplican al cambiar */}
            </form>


            {pasajes.length === 0 ? (
                <p>No hay pasajes vendidos para este viaje o que coincidan con los filtros.</p>
            ) : (
                <table className="tabla-pasajes-vendedor">
                    <thead>
                    <tr>
                        <th onClick={() => handleSortChange('clienteNombre')} style={{cursor: 'pointer'}}>
                            Cliente {getSortIndicator('clienteNombre')}
                        </th>
                        <th onClick={() => handleSortChange('numeroAsiento')} style={{cursor: 'pointer'}}>
                            Asiento N° {getSortIndicator('numeroAsiento')}
                        </th>
                        <th onClick={() => handleSortChange('precio')} style={{cursor: 'pointer'}}>
                            Precio {getSortIndicator('precio')}
                        </th>
                        <th onClick={() => handleSortChange('estado')} style={{cursor: 'pointer'}}>
                            Estado {getSortIndicator('estado')}
                        </th>
                        {/* Agrega más columnas si es necesario */}
                    </tr>
                    </thead>
                    <tbody>
                    {pasajes.map(pasaje => (
                        <tr key={pasaje.id}>
                            <td>{pasaje.clienteNombre || 'N/A'}</td>
                            <td>{pasaje.numeroAsiento}</td>
                            <td>${pasaje.precio ? pasaje.precio.toFixed(2) : 'N/A'}</td>
                            <td>{pasaje.estado}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            <Link to="/vendedor/listar-viajes" style={{display: 'block', marginTop: '20px'}}>Volver a Lista de Viajes</Link>
        </div>
    );
};

export default VendedorListadoPasajesViaje;