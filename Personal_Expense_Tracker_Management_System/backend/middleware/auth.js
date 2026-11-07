module.exports = function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please log in first.' });
    }
    next();
};
