import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [filters, setFilters] = useState({
    OrdenDeCompra: "",
    FechaInicio: "",
    FechaFin: "",
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

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Convertir fecha de formato DD/MM/YYYY a objeto Date
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  // Aplicar filtros
  useEffect(() => {
    const filtered = ordenes.filter((orden) => {
      const fechaOrden = parseDate(orden.Fecha);
      const fechaInicio = filters.FechaInicio
        ? new Date(filters.FechaInicio)
        : null;
      const fechaFin = filters.FechaFin ? new Date(filters.FechaFin) : null;

      return (
        (filters.OrdenDeCompra === "" ||
          orden.OrdenDeCompra.toLowerCase().includes(
            filters.OrdenDeCompra.toLowerCase()
          )) &&
        (!fechaInicio || fechaOrden >= fechaInicio) &&
        (!fechaFin || fechaOrden <= fechaFin) &&
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

  // Generar reporte (exportar a CSV)
  const generateReport = () => {
    const csvData = [
      [
        "ID",
        "Fecha",
        "Orden de Compra",
        "Proveedor",
        "Valor Neto",
        "Facturado",
      ],
      ...filteredOrdenes.map((orden) => [
        orden.ID,
        orden.Fecha,
        orden.OrdenDeCompra,
        orden.Proveedor,
        orden.ValorNeto,
        orden.facturado ? "Sí" : "No",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_ordenes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          type="date"
          name="FechaInicio"
          placeholder="Fecha Inicio"
          value={filters.FechaInicio}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="FechaFin"
          placeholder="Fecha Fin"
          value={filters.FechaFin}
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
        <button onClick={generateReport}>Generar Reporte</button>
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
                  onClick={() => {
                    if (orden.facturado) {
                      const password = window.prompt(
                        "Ingrese la contraseña para desmarcar:"
                      );
                      if (password === "STbest") {
                        axios
                          .put(`${API_URL}/ordenes/${orden.ID}`, {
                            facturado: !orden.facturado,
                          })
                          .then(() =>
                            setOrdenes((prevOrdenes) =>
                              prevOrdenes.map((o) =>
                                o.ID === orden.ID
                                  ? { ...o, facturado: !o.facturado }
                                  : o
                              )
                            )
                          )
                          .catch((error) =>
                            console.error(
                              "Error al actualizar la orden:",
                              error
                            )
                          );
                      } else {
                        alert("Contraseña incorrecta");
                      }
                    } else {
                      if (
                        window.confirm(
                          "¿Está seguro que desea marcar esta orden?"
                        )
                      ) {
                        axios
                          .put(`${API_URL}/ordenes/${orden.ID}`, {
                            facturado: !orden.facturado,
                          })
                          .then(() =>
                            setOrdenes((prevOrdenes) =>
                              prevOrdenes.map((o) =>
                                o.ID === orden.ID
                                  ? { ...o, facturado: !o.facturado }
                                  : o
                              )
                            )
                          )
                          .catch((error) =>
                            console.error(
                              "Error al actualizar la orden:",
                              error
                            )
                          );
                      }
                    }
                  }}
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
