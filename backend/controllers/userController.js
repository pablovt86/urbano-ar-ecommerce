const { Usuario } = require('../models');

const usuarioController = {
    // Para que el Admin vea a todos los registrados
    listar: async (req, res) => {
        try {
            const usuarios = await Usuario.findAll({
                attributes: { exclude: ['password_hash'] } // Seguridad: nunca enviar la contraseña
            });
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver perfil de un usuario específico
    obtenerUno: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.params.id, {
                attributes: { exclude: ['password_hash'] }
            });
            if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Por si el admin quiere borrar a un usuario
    eliminar: async (req, res) => {
        try {
            await Usuario.destroy({ where: { id: req.params.id } });
            res.json({ success: true, mensaje: "Usuario eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = usuarioController;
