const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    registro: async (req, res) => {
        try {
            const { nombre, email, password, rol } = req.body;

            // 1. Hashear la contraseña
            const password_hash = await bcrypt.hash(password, 10);

            // 2. Crear el usuario
            const nuevoUsuario = await Usuario.create({
                nombre,
                email,
                password_hash,
                rol: rol || 'cliente' // Si no viene nada, por defecto es cliente
            });

            // 3. Respuesta exitosa
            res.status(201).json({
                success: true,
                mensaje: "Usuario creado exitosamente",
                usuarioId: nuevoUsuario.id 
            });

        } catch (error) {
            console.error("Error en registro:", error);
            // Manejar error específico de email duplicado (Unique Constraint)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: "El email ya está registrado" });
            }
            res.status(400).json({ error: "Datos inválidos o error en el servidor" });
        }
    },
    
    // Aquí seguiría la función de login que armamos antes...



    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const usuario = await Usuario.findOne({ where: { email } });

            if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
                return res.status(401).json({ error: "Credenciales incorrectas" });
            }

            // Crear el Token
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol },
                'SECRETO_SUPER_SEGURO', // Debería ir en un .env
                { expiresIn: '24h' }
            );

            res.json({ mensaje: "Login exitoso", token, rol: usuario.rol });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = authController;
