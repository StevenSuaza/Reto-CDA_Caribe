// Importar módulos necesarios
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

// Configuración del servidor
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Configuración de la base de datos SQL Server
require('dotenv').config();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Para Azure, establecer en true
        trustServerCertificate: true // Establecer en true si usas SQL Server local
    }
};

// Ruta principal
app.get('/', (req, res) => {
    res.send('Servidor Node.js conectado a SQL Server.');
});

// Ruta para guardar citas
app.post('/submit', async (req, res) => {
    const { nombre, telefono, modelo, fecha } = req.body;

    if (!nombre || !telefono || !modelo || !fecha) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    try {
        // Conectar a la base de datos
        let pool = await sql.connect(dbConfig);

        // Insertar datos en la tabla de citas
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('telefono', sql.VarChar, telefono)
            .input('modelo', sql.VarChar, modelo)
            .input('fecha', sql.Date, fecha)
            .query(`INSERT INTO citas (nombre, telefono, modelo, fecha) 
                    VALUES (@nombre, @telefono, @modelo, @fecha)`);

        res.status(200).send('Cita registrada exitosamente.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar la cita.');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
