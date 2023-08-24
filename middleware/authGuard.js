const jwtToken = require("../utils/jwtToken");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        let decodeT = await jwtToken.decodeToken(token);

        if (!decodeT) {
            return res.status(401).json({
                message: "Authentication Failed",
            });
        }

        req.tokenData = decodeT;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Authentication Failed",
        });
    }
};
