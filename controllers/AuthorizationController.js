const Users = require("../models/UsersModel");

class AuthorizationController {
    static login = async (req, res, next)=>{
        try{
            const {name="", password=""} = req.body;
            const uid = req.headers.authorization;

            if(uid){
                return res.json({errorMessage: "user already authorized"});
            }
            const user = await Users.getUser({name});
            
            if(user){
                if(user.dataValues.password === password){
                    // res.cookie('uid', uid, {expires: new Date( (Date.now() + ((9999 * 60 * 60 * 60) * 1000)) )});
                    // res.cookie('uid', user.dataValues.id);
                    return res.json({message: "login succesfully", uid: user.dataValues.id});
                }
            }

            return res.json({errorMessage: "not found user invalid name or password"});
        }catch(err){
            return next(err);
        }
    }
}

module.exports = AuthorizationController;