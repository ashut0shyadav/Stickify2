const jwt = require('jsonwebtoken');
const secret = "thisisthetodosecret";

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');

    if(!token)
        res.status(401).json({error : "Unauthorized! Missing token"});

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch(err) {
        console.error(err);
        res.status(401).json({error : "Unauthorized! Invalid token"});
    }
};

module.exports = authenticateUser;