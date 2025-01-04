import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [filters, setFilters] = useState({
    OrdenDeCompra: "",
    Fecha: "",
    Proveedor: "",
    Facturado: "",
  });

  // Obtener las órdenes de la base de datos
  useEffect(() => {
    axios
      .get(`${API_URL}/ordenes`)
      .then((response) => {
        setOrdenes(response.data);
        setFilteredOrdenes(response.data);
      })
      .catch((error) => console.error("Error al cargar las órdenes:", error));
  }, []);

  // Marcar una orden como facturada o no
  const toggleFacturado = (id, currentState) => {
    if (currentState) {
      // Si la orden está facturada, solicitamos la contraseña para desmarcarla
      const password = prompt(
        "Por favor, ingresa la contraseña para desmarcar:"
      );
      if (password === "STBETS") {
        axios
          .put(`${API_URL}/ordenes/${id}`, { facturado: !currentState })
          .then(() => {
            setOrdenes((prevOrdenes) =>
              prevOrdenes.map((orden) =>
                orden.ID === id ? { ...orden, facturado: !currentState } : orden
              )
            );
          })
          .catch((error) =>
            console.error("Error al actualizar el estado de facturado:", error)
          );
      } else {
        alert("Contraseña incorrecta. No se puede desmarcar.");
      }
    } else {
      // Si la orden no está facturada, mostramos solo una confirmación para marcarla
      const confirmacion = window.confirm(
        "¿Estás seguro de marcar esta orden como facturada?"
      );
      if (confirmacion) {
        axios
          .put(`${API_URL}/ordenes/${id}`, { facturado: !currentState })
          .then(() => {
            setOrdenes((prevOrdenes) =>
              prevOrdenes.map((orden) =>
                orden.ID === id ? { ...orden, facturado: !currentState } : orden
              )
            );
          })
          .catch((error) =>
            console.error("Error al actualizar el estado de facturado:", error)
          );
      }
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Aplicar filtros
  useEffect(() => {
    const filtered = ordenes.filter((orden) => {
      return (
        (filters.OrdenDeCompra === "" ||
          orden.OrdenDeCompra.toLowerCase().includes(
            filters.OrdenDeCompra.toLowerCase()
          )) &&
        (filters.Fecha === "" || orden.Fecha.includes(filters.Fecha)) &&
        (filters.Proveedor === "" ||
          orden.Proveedor.toLowerCase().includes(
            filters.Proveedor.toLowerCase()
          )) &&
        (filters.Facturado === "" ||
          (filters.Facturado === "Sí" && orden.facturado) ||
          (filters.Facturado === "No" && !orden.facturado))
      );
    });
    setFilteredOrdenes(filtered);
  }, [filters, ordenes]);

  return (
    <div>
      <h1>Gestión de Órdenes</h1>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          name="OrdenDeCompra"
          placeholder="Orden de Compra"
          value={filters.OrdenDeCompra}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="Fecha"
          placeholder="Fecha (YYYY-MM-DD)"
          value={filters.Fecha}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="Proveedor"
          placeholder="Proveedor"
          value={filters.Proveedor}
          onChange={handleFilterChange}
        />
        <select
          name="Facturado"
          value={filters.Facturado}
          onChange={handleFilterChange}
        >
          <option value="">Todos</option>
          <option value="Sí">Facturados</option>
          <option value="No">Sin facturar</option>
        </select>
      </div>

      {/* Tabla */}
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Orden de Compra</th>
            <th>Proveedor</th>
            <th>Valor Neto</th>
            <th>Facturado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrdenes.map((orden) => (
            <tr key={orden.ID}>
              <td>{orden.ID}</td>
              <td>{orden.Fecha}</td>
              <td>{orden.OrdenDeCompra}</td>
              <td>{orden.Proveedor}</td>
              <td>{orden.ValorNeto}</td>
              <td>{orden.facturado ? "Sí" : "No"}</td>
              <td>
                <button
                  onClick={() => toggleFacturado(orden.ID, orden.facturado)}
                >
                  {orden.facturado ? "Desmarcar" : "Marcar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
