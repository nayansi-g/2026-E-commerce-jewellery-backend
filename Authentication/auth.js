const jwt = require("jsonwebtoken")

const authenticatedUser = async(req,res,next)=>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }
    const token = authHeader.split(" ")[1]

    let authorizedUser = await jwt.verify(token , "jwt_secret")
    if(authorizedUser){
           authorizedUser.isAdmin = authorizedUser.role == "admin";
            req.user = authorizedUser
            next()
    }

    } catch (error) {
        console.log(error, "Error")
        res.status(500).json({
            message: "Something went wrong!",error
        })
    }
}

module.exports = authenticatedUser