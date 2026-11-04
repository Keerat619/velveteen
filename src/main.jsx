import '@fontsource-variable/tiktok-sans/wdth.css';
import '@fontsource/brygada-1918/latin-400.css';
import '@fontsource-variable/playwrite-us-trad/wght.css';
import './styles.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </CartProvider>
  </BrowserRouter>,
);
