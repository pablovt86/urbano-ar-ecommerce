const jwt = require('jsonwebtoken');

const soloAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Formato: Bearer TOKEN

    if (!token) return res.status(403).json({ error: "No se proporcionó token" });

    jwt.verify(token, 'SECRETO_SUPER_SEGURO', (err, decoded) => {
        if (err) return res.status(401).json({ error: "Token inválido o expirado" });
        
        if (decoded.rol !== 'admin') {
            return res.status(403).json({ error: "Acceso denegado: se requiere rol admin" });
        }
        
        req.usuarioId = decoded.id;
        next();
    });
};

module.exports = soloAdmin;
