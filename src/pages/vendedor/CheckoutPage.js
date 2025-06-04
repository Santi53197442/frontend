// src/pages/vendedor/CheckoutPage.js
import React from 'react';
import Checkout from './Checkout'; // Asumiendo que Checkout.js está en el mismo directorio de páginas
// Si moviste Checkout.js a src/components/vendedor/Checkout.js,
// entonces la importación sería: import Checkout from '../../components/vendedor/Checkout';

const CheckoutPage = () => {
    return (
        <div>
            <Checkout />
        </div>
    );
};

export default CheckoutPage;