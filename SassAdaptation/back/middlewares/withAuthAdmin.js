const withAdminAuth = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    return res.json({ status: 403, msg: "Accès interdit, seul un admin peut accéder à cette ressource" });
};

module.exports = withAdminAuth;