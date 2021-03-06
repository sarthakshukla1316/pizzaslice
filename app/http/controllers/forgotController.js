const Menu = require('../../models/menu');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

function forgotController() {
    return {
        showSendOtp(req, res) {
            res.render('auth/forgotPassword/sendOtpForgot');
        },

        async sendOtpForgot(req, res) {

            const {email} = req.body;
            if(!email) {
                req.flash('error', 'Invalid email');
                req.flash('email', email);
                return res.redirect('/sendOtpForgot');
            }
            let user = await User.findOne({ email: email});
            if(!user) {
                req.flash('error', 'Invalid user');
                req.flash('email', email);
                return res.redirect('/sendOtpForgot');
            }
            
            const otp = Math.floor(Math.random() * 1000000) + 10000;
            let markupCustomer = `
                    <div style="height: 60px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; margin-top: 20px;">Verification Code</h1>
                    </div>
                    <h1>Your Verification code is <br /> ${otp}</h1>
                    <p>Please do not disclose this OTP with anyone.</p>
                `;
                const subjectCustomer = 'Pizza Slice - Forgot Password Otp';
                const toEmailCustomer = email;
                mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

                await User.updateOne({email: email}, { forgotOtp: otp}).then((user) => {
                    req.flash('email', email);
                    req.flash('success', 'A verification code has been sent on your email.');
                    return res.redirect('/setPassword');
                }).catch(err => {
                    req.flash('error', 'Something went wrong');
                    return res.redirect('/sendOtpForgot');
                })

        },

        showSetPassword(req, res) {
            res.render('auth/forgotPassword/setPassword');
        },
        async setPassword(req, res) {
            const {email, otp, newPassword} = req.body;
            if(!email || !otp || !newPassword) {
                req.flash('error', 'Invalid email, otp or password');
                req.flash('email', email);
                req.flash('otp', otp);
                return res.redirect('/setPassword');
            }

            const user = await User.findOne({ email: email });            // Check email exists or not
            if(!user) {
                req.flash('error', 'Invalid User');
                req.flash('email', email);
                req.flash('otp', otp);
                return res.redirect('/verifyOtpForgot');
            }

            if(user.forgotOtp !== otp) {
                req.flash('error', 'Invalid OTP');
                req.flash('email', email);
                req.flash('otp', otp);
                return res.redirect('/setPassword');
            }

            if(newPassword.length < 6) {
                req.flash('error', 'Password should be of atleast 6 characters');
                req.flash('email', email);
                req.flash('otp', otp);
                return res.redirect('/setPassword');
            }

            let uc=0, lc=0, sc=0, d=0;
            for(let i=0; i<newPassword.length; i++) {
                let ch=newPassword.charAt(i);
                let as = ch;
                if(as >=65 && as<=90) uc++;
                else if(as>=97 && as<=122) lc++;
                else if(as >=48 && as<=57) d++;
                else sc++;
            }
            if(uc<1 || lc<1 || sc<1 || d<1) {
                req.flash('error', 'Password should contain atleast One uppercase, one lowercase, one digit and one special character');
                req.flash('email', email);
                req.flash('otp', otp);
                return res.redirect('/setPassword');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10); 

            await User.updateOne({email: email}, { password: hashedPassword}).then((user) => {
                req.flash('email', email);
                req.flash('success', 'Password has been changed successfully.');
                return res.redirect('/login');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/setPassword');
            })
        }
    }
}



module.exports = forgotController