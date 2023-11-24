const jwt = require('jsonwebtoken');
 

module.exports = function(req, res, next){
    if(!global.token) return res.status(401).send('Access denied');
    //verification  
    try{
        const verified = jwt.verify(global.token, process.env.SECRET_TOKEN); //passing token
        req.user = verified;
        next();
    } catch(err){
        res.send(400).send('Invalid token');
    }
}