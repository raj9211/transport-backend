const User = require("../models/users");
const bcrypt = require("../utils/bcrypt");
const { createToken, decodeToken } = require("../utils/jwtToken");


async function create(req, res) {
    try {
        const body = req.body;

        if (typeof body.email == "undefined" || body.email == "") {
            return res.status(400).send({
                success: false,
                message: "Email is required.",
            });
        }
        if (typeof body.phone == "undefined" || body.phone == "") {
            return res.status(400).send({
                success: false,
                message: "Phone is required.",
            });
        }

        const userExists = await User.count({
            $or: [
                {
                    email: body.email,
                },
                {
                    phone: body.phone,
                },
            ]
        });

        if (userExists > 0) {
            return res.status(400).send({
                success: false,
                message: "User already exists, please use different Email-ID Or Phone",
            });
        }

        // Encrypt Password
        const encryptPassword = await bcrypt.encode(body.password);


        // User Payload
        let userPayload = {
            name: body.name,
            email: body.email,
            password: encryptPassword,
            phone: body.phone,
            role: "user",
            state: body.state,
            country: body.country,
            createdBy: body.email,
        };

        const newUser = await User.create(userPayload);

        // Generate Token
        const authToken = await createToken(
            { userId: newUser._id },
            "30d"
        );

        newUser.password = undefined;
        delete newUser.password;

        return res.status(200).send({
            message: "User created successfully",
            data: newUser,
            authToken,
            success: true,
        });

    } catch (error) {
        const errObj = new Error(error);
        return res.status(500).send({
            message: errObj.message,
            success: false
        })
    }
}

async function userLogin(req, res) {
    try {
        const body = req.body;
        // const userId = req.tokenData.userId;

        // User Exists Check
        const userExists = await User.findOne({
            email: body.email,
        });

        if (!userExists) {
            return res.status(400).send({
                success: false,
                message:
                    "It appears that the user does not exist or has been deactivated, please contact admin",
            });
        }

        // Decode Password
        const decodedPassword = await bcrypt.decode(body.password, userExists.password);
        if (!decodedPassword) {
            return res.status(400).send({
                success: false,
                message: "Please check your valid password",
            });
        }

        // Generate Token
        const authToken = await createToken(
            { userId: userExists._id },
            "30d"
        );

        userExists.password = undefined;
        delete userExists.password;

        return res.status(200).send({
            success: true,
            message: "User logged in successfully",
            user: userExists,
            authToken
        });

    } catch (error) {
        console.log("catch err", error);
        const errObj = new Error(error);
        return res.status(500).send({
            message: errObj.message,
            success: false
        })
    }
}


async function getUsers(req, res) {
    try {
        let users = await User.find({}).sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Get Users Successfully",
            data: users,
        });
    } catch (error) {
        const errObj = new Error(error);
        return res.status(500).send({
            message: errObj.message,
            success: false
        })
    }

}



async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Reset password link error" });
        }

        const token = await createToken({ userId: user._id }, "20m");

        // await User.findOneAndUpdate(
        //   { _id: user._id },
        //   { passwordResetToken: token }
        // );

        await sendEmail.sendEmail("RESETPASSWORD", [user.email], {
            text: "Please click on given link to reset your password",
            resetLink: `${process.env.NODE_ENV === "dev"
                ? process.env.UI_ENDPOINT
                : process.env.PROD_ENDPOINT}reset-password?token=${token}`,
        });

        return res.status(200).send({ message: "Password reset email sent" });
    } catch (e) {
        const errObj = new Error(e);
        return res.status(400).send({
            message: errObj.message,
            success: false,
        });
    }
};

async function resetPassword(req, res) {
    try {
        const { passwordResetToken, newPassword } = req.body;

        if (!passwordResetToken) {
            return res.status(400).send({
                message: "Error in Password Reset Token",
                success: false,
            });
        }

        let decodeData = await decodeToken(passwordResetToken);
        let bcryptPassword = await bcryptPass.encode(newPassword);

        await User.findOneAndUpdate(
            { _id: decodeData.userId },
            {
                $unset: {
                    passwordResetToken: 1,
                },
                $set: {
                    password: bcryptPassword,
                },
            }
        );

        return res.status(200).send({ message: "Your password has been changed" });
    } catch (e) {
        console.log("error", e);
        const errObj = new Error(e);
        return res.status(400).send({
            message: errObj.message,
            success: false,
        });
    }
};

async function aggregateFunctionTesting(req, res) {
    try {

        // const userType = await User.distinct("logs.type");
        // const userValue = await User.distinct("logs.value");


        const userType = await User.aggregate([{ $project: { uniqueType: '$logs.type' } },
        { $unwind: '$uniqueType' },
        { $group: { _id: 'uniqueType', items: { $addToSet: '$uniqueType' } } }
        ]);

        const userValue = await User.aggregate([{ $project: { uniqueValue: '$logs.value' } },
        { $unwind: '$uniqueValue' },
        { $group: { _id: 'uniqueValue', items: { $addToSet: '$uniqueValue' } } }
        ]);

        // const user = await User.aggregate([
        //     {
        //         $group: { _id: { uniqueType: "$logs.type", uniqueValue: "$logs.value" } }
        //     },
        // ])



        return res.status(200).send({
            success: true,
            message: "Data found successfully",
            data: userType, userValue
        });

    } catch (error) {
        console.log("err", error);
        const errObj = new Error(error);
        return res.status(400).send({
            message: errObj.message,
            success: false
        })
    }
}



module.exports = {
    create,
    getUsers,
    userLogin,
    forgotPassword,
    resetPassword,
    aggregateFunctionTesting
}