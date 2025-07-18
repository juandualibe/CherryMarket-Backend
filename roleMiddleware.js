module.exports = function(req, res, next) {
    // Asumimos que el authMiddleware ya se ejecutó y tenemos req.user
    if (req.user && req.user.role === 'admin') {
        next(); // El usuario es admin, puede continuar
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};