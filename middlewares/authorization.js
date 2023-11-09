const Users = require("../models/UsersModel");

const Authorization = async (req, res, next) => {
    try{
        const uid = req.headers.authorization;
        if(!uid){
            return res.status(401).json({errorMessage: "client unauthorized"});
        }
        return next(uid);
    }catch(error){
        return res.json({error});
    }
}

module.exports = Authorization;