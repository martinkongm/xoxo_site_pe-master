import React, { useState, useEffect } from 'react';
import './ShippingCalculator.css';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const ShippingCalculator = ({ subtotal, carritoId, products = [] }) => {
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [preferenceId, setPreferenceId] = useState(null);
  const [paidFor, setPaidFor] = useState(false);
  const [error, setError] = useState(null);

  const createPreference = async () => {
    try {
      const responseCarrito = await axios.get(`http://localhost:8080/api/v1/carrito/${carritoId}`);
      const carritoDetalles = responseCarrito.data.object.detalles;
      const responseMP = await axios.post('http://localhost:8080/api/v1/mp', carritoDetalles);
      return responseMP.data;
    } catch (error) {
      console.error('Error creating preference:', error);
      return null;
    }
  };

  const handleBuy = async () => {
    const id = await createPreference();
    if (id) {
      setPreferenceId(id);
    }
  };

  const handleCalculate = () => {
    console.log('Calculando envío...');
  };

  const handleApprove = (orderId) => {
    setPaidFor(true);
    alert("Thank You for purchasing from Eazy2Code");
  };

  return (
    <div className="shipping-calculator">
      <div className="form-section mt-3 mx-5 mb-3">
        <h2>Envío</h2>
        <p>Ingresa los detalles para calcular el costo de envío:</p>
        <form>
          <div className="form-group">
            <label>País</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="País" />
          </div>
          <div className="form-group">
            <label>Provincia</label>
            <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Provincia" />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" />
          </div>
          <button type="button" onClick={handleCalculate} className="btn btn-dark">Calcular</button>
        </form>
      </div>
      <div className="summary-section mt-3 mx-5">
        <div className="summary-item">
          <div className="font-weight-bold">SUBTOTAL</div>
          <div className="value">S/. {subtotal.toFixed(2)}</div>
        </div>
        <div className="summary-item">
          <div className="font-weight-bold">SHIPPING MODE</div>
          <div className="value">Standard</div>
        </div>
        <hr />
        <div className="summary-item">
          <div className="label">TOTAL</div>
          <div className="value">S/. {subtotal.toFixed(2)}</div>
          <div className="paypal">
        </div>
      </div>

      <div className="separator"></div>
        <div className="paypal-button-container">
          <PayPalScriptProvider>
            <PayPalButtons
              onClick={(data, actions) => {
                const hasAlreadyBoughtCourse = false;
                if (hasAlreadyBoughtCourse) {
                  setError("You already bought this course");
                  return actions.reject();
                } else {
                  return actions.resolve();
                }
              }}
              createOrder={(data, actions) => {
                const totalValue = subtotal.toFixed(2);
                const items = products.map(product => ({
                  name: product.nombreProducto,
                  unit_amount: {
                    value: product.precioProducto.toFixed(2),
                    currency_code: 'USD',
                  },
                  quantity: product.quantity,
                }));

                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: totalValue,
                        currency_code: 'USD',
                        breakdown: {
                          item_total: {
                            currency_code: 'USD',
                            value: totalValue,
                          }
                        }
                      },
                      items: items,
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                const order = await actions.order.capture();
                console.log("order", order);
                handleApprove(data.orderID);
              }}
              onCancel={() => { }}
              onError={(err) => {
                setError(err);
                console.log("PayPal Checkout onError", err);
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ShippingCalculator;
