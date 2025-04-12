import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { 
    cartItems, 
    cartTotal, 
    removeFromCart, 
    updateQuantity 
  } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="container text-center my-5">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary mt-3">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Your Shopping Cart</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={item.product._id}>
                <td>
                  <Link to={`/product/${item.product._id}`}>
                    {item.product.name}
                  </Link>
                </td>
                <td>${item.product.price.toFixed(2)}</td>
                <td>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(
                      item.product._id, 
                      parseInt(e.target.value))
                    }
                    className="form-control"
                    style={{ width: '70px' }}
                  />
                </td>
                <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="text-end fw-bold">Total:</td>
              <td colSpan="2" className="fw-bold">${cartTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="text-end">
        <button className="btn btn-primary btn-lg">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}