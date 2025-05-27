// src/components/Vendedor/VendedorCambiarOmnibusaOperativo.js (o donde lo ubiques)
import React, { useState, useEffect, useCallback } from 'react';
import { obtenerOmnibusPorEstado, marcarOmnibusOperativo } from '../../services/api'; // Ajusta la ruta a tu archivo de API
import { Table, Button, Alert, Spinner, Modal, Typography } from 'antd'; // Asumiendo que usas Ant Design
// Si no usas Ant Design, reemplaza estos componentes con los equivalentes de tu librería UI o HTML estándar.

const { Title, Text } = Typography;

const ESTADO_BUSQUEDA = "INACTIVO"; // Estado que queremos listar

const VendedorCambiarOmnibusaOperativo = () => {
    const [omnibusInactivos, setOmnibusInactivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedOmnibus, setSelectedOmnibus] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOmnibusInactivos = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const response = await obtenerOmnibusPorEstado(ESTADO_BUSQUEDA);
            if (response.status === 204) { // No Content
                setOmnibusInactivos([]);
            } else if (response.data) {
                setOmnibusInactivos(response.data);
            } else {
                setOmnibusInactivos([]);
            }
        } catch (err) {
            console.error("Error al cargar ómnibus inactivos:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los ómnibus inactivos. Intente más tarde.");
            setOmnibusInactivos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOmnibusInactivos();
    }, [fetchOmnibusInactivos]);

    const handleMarcarOperativoClick = (omnibus) => {
        setSelectedOmnibus(omnibus);
        setIsModalVisible(true);
    };

    const handleConfirmMarcarOperativo = async () => {
        if (!selectedOmnibus) return;

        setLoading(true);
        setError(null);
        setSuccessMessage('');
        setIsModalVisible(false);

        try {
            const response = await marcarOmnibusOperativo(selectedOmnibus.id);
            setSuccessMessage(`El ómnibus con matrícula ${selectedOmnibus.matricula} (ID: ${selectedOmnibus.id}) ha sido marcado como OPERATIVO exitosamente.`);
            setSelectedOmnibus(null);
            // Refrescar la lista para remover el ómnibus que ya no está inactivo
            fetchOmnibusInactivos();
        } catch (err) {
            console.error("Error al marcar ómnibus como operativo:", err);
            setError(err.response?.data?.message || `No se pudo marcar el ómnibus ${selectedOmnibus.matricula} como operativo.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setSelectedOmnibus(null);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
        { title: 'Matrícula', dataIndex: 'matricula', key: 'matricula', sorter: (a, b) => a.matricula.localeCompare(b.matricula) },
        { title: 'Marca', dataIndex: 'marca', key: 'marca' },
        { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
        { title: 'Capacidad', dataIndex: 'capacidadAsientos', key: 'capacidadAsientos' },
        {
            title: 'Localidad Actual',
            dataIndex: ['localidadActual', 'nombre'], // Acceder a la propiedad anidada
            key: 'localidadActual',
            render: (nombre, record) => `${nombre} (${record.localidadActual?.departamento || 'N/A'})`
        },
        {
            title: 'Estado Actual',
            dataIndex: 'estado',
            key: 'estado',
            render: (estado) => <Text type={estado === 'INACTIVO' ? 'danger' : 'secondary'}>{estado}</Text>
        },
        {
            title: 'Acción',
            key: 'accion',
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => handleMarcarOperativoClick(record)}
                    disabled={loading}
                >
                    Marcar Operativo
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}>Marcar Ómnibus Inactivo como Operativo</Title>
            <Text style={{ marginBottom: '20px', display: 'block' }}>
                Aquí se listan los ómnibus que actualmente se encuentran en estado "{ESTADO_BUSQUEDA}".
                Seleccione un ómnibus para cambiar su estado a "OPERATIVO".
            </Text>

            {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} style={{ marginBottom: '20px' }} />}
            {successMessage && <Alert message="Éxito" description={successMessage} type="success" showIcon closable onClose={() => setSuccessMessage('')} style={{ marginBottom: '20px' }} />}

            {loading && !omnibusInactivos.length && <div style={{ textAlign: 'center', margin: '20px' }}><Spinner size="large" /> <p>Cargando ómnibus inactivos...</p></div>}

            <Table
                columns={columns}
                dataSource={omnibusInactivos}
                rowKey="id"
                loading={loading && omnibusInactivos.length > 0} // Mostrar spinner en tabla si ya hay datos y se está recargando
                bordered
                size="small"
                pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                locale={{ emptyText: 'No hay ómnibus en estado INACTIVO.' }}
            />

            {selectedOmnibus && (
                <Modal
                    title="Confirmar Acción"
                    visible={isModalVisible}
                    onOk={handleConfirmMarcarOperativo}
                    onCancel={handleCancelModal}
                    confirmLoading={loading}
                    okText="Confirmar"
                    cancelText="Cancelar"
                >
                    <p>
                        ¿Está seguro de que desea marcar el ómnibus con matrícula <strong>{selectedOmnibus.matricula}</strong> (ID: {selectedOmnibus.id}) como <strong>OPERATIVO</strong>?
                    </p>
                    <p>Estado actual: <Text type="danger">{selectedOmnibus.estado}</Text></p>
                </Modal>
            )}
        </div>
    );
};

export default VendedorCambiarOmnibusaOperativo;