const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;


// Middleware
app.use(bodyParser.json());
app.use(cors());

// Conexión a la base de datos
const db = new sqlite3.Database("../ordenes.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos", err);
    } else {
        console.log("Conexión exitosa con SQLite");
    }
});

// Crear tabla con columna facturado si no existe
db.run(
    `ALTER TABLE Ordenes ADD COLUMN facturado BOOLEAN DEFAULT 0;`,
    (err) => {
        if (err) {
            if (!err.message.includes("duplicate column name")) {
                console.error("Error al agregar la columna 'facturado':", err);
            }
        } else {
            console.log("Columna 'facturado' añadida con éxito.");
        }
    }
);

// Endpoint: Obtener todas las órdenes
app.get("/ordenes", (req, res) => {
    db.all("SELECT * FROM Ordenes", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Endpoint: Actualizar estado de facturado
app.put("/ordenes/:id", (req, res) => {
    const { id } = req.params;
    const { facturado } = req.body;
    db.run(
        `UPDATE Ordenes SET facturado = ? WHERE ID = ?`,
        [facturado, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ updated: this.changes });
            }
        }
    );
});

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
