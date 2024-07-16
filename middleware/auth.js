const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
   
    const token = req.headers.authorization
    
    if(!token){
        return res.status(401).json({error: 'access not authorised'})
    }

    jwt.verify(token, process.env.SECRET, (err, {userId}) => {
        if(err) return res.status(403).json({error:'could not verify'})

        req.userId = userId
        
        next()
    })
}

module.exports = auth