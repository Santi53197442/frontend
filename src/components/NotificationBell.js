// Ruta del archivo: src/components/NotificationBell.js

import React, { useState, useEffect, useRef } from 'react';
import { getUnreadNotificationsCount, getMyNotifications, markNotificationAsRead } from '../services/api';
import './NotificationBell.css'; // Importamos los estilos

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Función para obtener el conteo de no leídas
    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadNotificationsCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error("Error al obtener el conteo de notificaciones:", error);
        }
    };

    // Efecto para cargar el conteo al inicio y luego periódicamente
    useEffect(() => {
        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 60000); // Revisa cada minuto
        return () => clearInterval(intervalId);
    }, []);

    // Efecto para cerrar el dropdown si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);


    const toggleDropdown = async () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        // Si se está abriendo, cargar la lista de notificaciones
        if (nextState) {
            try {
                const response = await getMyNotifications();
                setNotifications(response.data);
            } catch (error) {
                console.error("Error al cargar notificaciones:", error);
            }
        }
    };

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation(); // Evita que el dropdown se cierre al hacer clic en el botón
        try {
            await markNotificationAsRead(id);
            // Actualiza la UI localmente para una respuesta más rápida
            setNotifications(notifications.map(n => n.id === id ? { ...n, leida: true } : n));
            // Disminuye el contador de no leídas
            setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        } catch (error) {
            console.error("Error al marcar como leída:", error);
        }
    };

    // Muestra "9+" si el contador supera 9
    const displayCount = unreadCount > 9 ? '9+' : unreadCount;

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={toggleDropdown}>
                <i className="fa fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{displayCount}</span>
                )}
            </div>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notificaciones</h3>
                    </div>
                    <ul className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <li key={notif.id} className={`notification-item ${!notif.leida ? 'unread' : ''}`}>
                                    <p>{notif.mensaje}</p>
                                    <small>{new Date(notif.fechaCreacion).toLocaleString()}</small>
                                    {!notif.leida && (
                                        <button onClick={(e) => handleMarkAsRead(e, notif.id)} className="mark-as-read-btn">
                                            Marcar como leída
                                        </button>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="no-notifications">No tienes notificaciones nuevas.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;