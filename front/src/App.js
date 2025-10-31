// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AppRouter from './components/routing/AppRouter';

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            {/* AppRouter contiene la lógica de rutas,
              incluyendo las rutas públicas y privadas (con MainLayout)
            */}
            <AppRouter />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;