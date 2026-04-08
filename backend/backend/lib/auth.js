module.exports = {
    isLoggedIn(req, res, next){
        if (req.isAuthenticated()){
            return next()
        }
        return res.json ({message: 'No a iniciado sesión'})
    },

    isNotLoggedIn (req, res, next){
        if (!req.isAuthenticated()) {
            return next()
        }
        return res.json({ message: 'Esta con la sesión iniciada' })
    }
}