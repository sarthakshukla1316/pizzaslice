const User = require('../../models/user')
const bcrypt = require('bcrypt');
const passport = require('passport');
const mailSender = require('./customers/mailSender');
let springedge = require('springedge');


function authController() {

    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders';
    }

    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next) {
            passport.authenticate('local', (err, user, info) => {

                const { email, password } = req.body;

                if( !email || !password) {         //  Validate user data
                    req.flash('error', 'All fields are required');
                    return res.redirect('/login');
                }

                if(err) {
                    req.flash('error', info.message);
                    return next(err);
                }
                if(!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }

                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message);
                        return next(err);
                    }

                    return res.redirect(_getRedirectUrl(req));
                })

            })(req, res, next)
        },

        sendOtp(req, res) {
            res.render('auth/sendOtp');
        },

        async postSendOtp(req, res) {
            const {email} = req.body;
            if(!email) {
                req.flash('error', 'Invalid email');
                req.flash('email', email);
                return res.redirect('/sendOtp');
            }
            let user = await User.findOne({ email: email});
            if(!user) {
                req.flash('error', 'Invalid user');
                req.flash('email', email);
                return res.redirect('/sendOtp');
            }

            if(user.isVerified === true) {
                req.flash('error', 'Email has already been verified');
                req.flash('email', email);
                return res.redirect('/login');
            }
            
            const otp = Math.floor(Math.random() * 1000000) + 10000;
            let markupCustomer = `
                    <div style="height: 60px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; margin-top: 20px;">Verification Code</h1>
                    </div>
                    <h1>Your Verification code is <br /> ${otp}</h1>
                    <p>Please do not disclose this OTP with anyone.</p>
                `;
                const subjectCustomer = 'Pizza Slice - OTP Verification';
                const toEmailCustomer = email;
                mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

                await User.updateOne({email: email}, { otp: otp}).then((user) => {
                    req.flash('email', email);
                    req.flash('success', 'A verification code has been sent on your email.');
                    return res.redirect('/otpVerify');
                }).catch(err => {
                    req.flash('error', 'Something went wrong');
                    return res.redirect('/sendOtp');
                })

        },

        async postSendOtpPhone(req, res) {
            const {phone} = req.body;
            if(!phone) {
                req.flash('error1', 'Invalid phone');
                req.flash('phone', phone);
                return res.redirect('/sendOtp');
            }
            let user = await User.findOne({ phone: phone});
            if(!user) {
                req.flash('error1', 'Invalid user');
                req.flash('phone', phone);
                return res.redirect('/sendOtp');
            }

            if(user.isVerified === true) {
                req.flash('error1', 'phone number has already been verified');
                req.flash('phone', phone);
                return res.redirect('/login');
            }

            const otp = Math.floor(Math.random() * 1000000) + 10000;
 
            let params = {
            'sender': 'SEDEMO',
            'apikey': '6ojfpx3g160a1vv2279dtl3m42x9qekd',
            'to': [
                `91${phone}`  //Mobile Numbers 
            ],
            // 'message': `Hello ${user.name} , your verification code is ${otp}`,Hello, This is a test message from spring edge
            'message': `Hello ${otp} , This is a test message from spring edge`,
            'format': 'json'
            };
            
            springedge.messages.send(params, 5000, function (err, response) {
            if (err) {
                return console.log(err);
            }
            console.log(response);
            });
            
            
                await User.updateOne({phone: phone}, { otp: otp}).then((user) => {
                    req.flash('phone', phone);
                    req.flash('success', 'A verification code has been sent on your phone number.');
                    return res.redirect('/otpVerify');
                }).catch(err => {
                    req.flash('error1', 'Something went wrong');
                    return res.redirect('/sendOtp');
                })

        },

        otpVerification(req, res) {
            res.render('auth/otpVerify');
        },

        async postOtpVerification(req, res) {
            const {email, otp} = req.body;
            if(!email || !otp) {
                req.flash('error', 'Invalid email or OTP');
                req.flash('otp', otp);
                return res.redirect('/register');
            }
            // res.render('auth/otpVerify');

            const user = await User.findOne({ email: email });            // Check email exists or not
            if(!user) {
                req.flash('error', 'Invalid User');
                req.flash('otp', otp);
                return res.redirect('/otpVerify');
            }

            if(user.isVerified === true) {
                req.flash('success', 'Email has already been verified');
                req.flash('email', email);
                return res.redirect('/login');
            }

            if(user.otp !== otp) {
                req.flash('error', 'Invalid OTP');
                req.flash('otp', otp);
                return res.redirect('/otpVerify');
            }

            user.isVerified = true;
            await user.save().then((user) => {
                // Login 
                req.flash('email', email);
                req.flash('success', 'Email has been verified successfully');
                return res.redirect('/login');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/otpVerify');
            })
        },

        async postOtpVerificationPhone(req, res) {
            const {phone, otp} = req.body;
            if(!phone || !otp) {
                req.flash('error1', 'Invalid phone or OTP');
                req.flash('otp1', otp);
                return res.redirect('/register');
            }
            // res.render('auth/otpVerify');

            const user = await User.findOne({ phone: phone });            // Check email exists or not
            if(!user) {
                req.flash('error1', 'Invalid User');
                req.flash('otp1', otp);
                return res.redirect('/otpVerify');
            }

            if(user.isVerified === true) {
                req.flash('success1', 'Phone number has already been verified');
                req.flash('phone', phone);
                return res.redirect('/login');
            }

            if(user.otp !== otp) {
                req.flash('error1', 'Invalid OTP');
                req.flash('otp1', otp);
                return res.redirect('/otpVerify');
            }

            user.isVerified = true;
            await user.save().then((user) => {
                // Login 
                req.flash('phone', phone);
                req.flash('email', email);
                req.flash('success', 'Phone number has been verified successfully');
                return res.redirect('/login');
            }).catch(err => {
                req.flash('error1', 'Something went wrong');
                return res.redirect('/otpVerify');
            })
        },

        register(req, res) {
            res.render('auth/register');
        },

        async postRegister(req, res) {

            const { name, email, phone, password, confirmPassword } = req.body;
            // console.log(req.body);
            if(!name || !email || !phone || !password || !confirmPassword) {         //  Validate user data
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                req.flash('phone', phone);
                return res.redirect('/register');
            }

            User.exists({ email: email }, async (err, result) => {         //   Check email exists or not in DB
                if(result) {
                    req.flash('error', 'Email already exists');
                    req.flash('name', name);
                    req.flash('email', email);
                    req.flash('phone', phone);
                    return res.redirect('/register');
                }
            })
            User.exists({ phone: phone }, async (err, result) => {         //   Check phone exists or not in DB
                if(result) {
                    req.flash('error', 'Phone number already exists');
                    req.flash('name', name);
                    req.flash('email', email);
                    req.flash('phone', phone);
                    return res.redirect('/register');
                }
            })

            if(password !== confirmPassword) {
                req.flash('error', 'Password and Confirm password doesn\'t match');
                req.flash('name', name);
                req.flash('email', email);
                req.flash('phone', phone);
                return res.redirect('/register');
            }

            const hashedPassword = await bcrypt.hash(password, 10);           //   Hash password
            const otp = Math.floor(Math.random() * 1000000) + 10000;

            const user = new User({           //   Create a user in DB
                name,
                email,
                phone,
                password: hashedPassword,
                otp
            })

            let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 20px;">Verification Code</h1>
                    </div>
                    <h1>Your Verification code is <br /> </h1>
                    <p>${otp}</p>
                    <p>Please do not disclose this OTP with anyone.</p>
                `;
                const subjectCustomer = 'Pizza Slice - OTP Verification';
                const toEmailCustomer = email;
                mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

            await user.save().then((user) => {
                // Login 
                req.flash('email', email);
                req.flash('phone', phone);
                req.flash('success', 'A verification code has been sent on your email.');
                return res.redirect('/otpVerify');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            })

        },

        logout(req, res) {
            req.logout();
            return res.redirect('/');
        }
    }
}



module.exports = authController