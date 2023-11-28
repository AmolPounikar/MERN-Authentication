import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import UserModel from "../model/UserModel.js";
dotenv.config();

// $2b$10$RB962EoF6ULR8MbLF/SdauvdfplqY3poU.00d8QziO92tQ5rV8g6q

/** middleware for verify user */
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;

        // Check the user existence
        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });

        // Call next() to proceed to the next middleware or route handler
        next();
    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}


/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body;

        // Check if the username is already taken
        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Please use a unique username" });
        }

        // Check if the email is already taken
        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Please use a unique email" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new UserModel({
            username,
            password: hashedPassword,
            profile: profile || '',
            email,
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Respond with the saved user data or an appropriate response
        res.status(201).json({ msg: "User registered successfully", user: savedUser });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {

    const { username, password } = req.body;

    try {

        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if (!passwordCheck) return res.status(400).send({ error: "Don't have Password" });

                        // create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, process.env.JWT_SECRET, { expiresIn: "24h" });

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user.username,
                            token
                        });

                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Password does not Match" })
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "Username not Found" });
            })

    } catch (error) {
        return res.status(500).send({ error });
    }
}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(501).send({ error: "Invalid Username" });
        }

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send({ error: "Couldn't Find the User" });
        }

        // Remove password from user
        const { password, ...rest } = user.toObject();

        return res.status(201).send(rest);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}


/** PUT: http://localhost:8080/api/updateuser */
export async function updateUser(req, res) {
    try {
        // Use optional chaining to handle undefined req.user
        const { userId } = req.user || {};

        if (!userId) {
            return res.status(401).send({ error: "User Not Authenticated...!" });
        }

        const body = req.body;

        // Use findByIdAndUpdate for simplicity
        const result = await UserModel.findByIdAndUpdate(userId, body, { new: true });

        if (result) {
            return res.status(200).send({ msg: "Record Updated...!" });
        } else {
            return res.status(404).send({ error: "User Not Found...!" });
        }
    } catch (error) {
        console.error("Error in updateUser:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.status(201).send({ code: req.app.locals.OTP })
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successsfully!' })
    }
    return res.status(400).send({ error: "Invalid OTP" });
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag: req.app.locals.resetSession })
    }
    return res.status(440).send({ error: "Session expired!" })
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {
        if (!req.app.locals.resetSession) return res.status(440).send({ error: "Session expired!" });

        const { username, password } = req.body;

        try {
            UserModel.findOne({ username })
                .then(user => {
                    if (!user) {
                        return res.status(404).send({ error: "Username not Found" });
                    }

                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            UserModel.updateOne(
                                { username: user.username },
                                { password: hashedPassword }
                            )
                                .then(() => {
                                    req.app.locals.resetSession = false;
                                    return res.status(201).send({ msg: "Record Updated...!" });
                                })
                                .catch(err => {
                                    return res.status(500).send({
                                        error: "Unable to update password"
                                    });
                                });
                        })
                        .catch(e => {
                            return res.status(500).send({
                                error: "Unable to hash password"
                            });
                        });
                })
                .catch(error => {
                    return res.status(500).send({ error: "Error finding user" });
                });
        } catch (error) {
            return res.status(500).send({ error });
        }
    } catch (error) {
        return res.status(401).send({ error });
    }
}

