const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')


function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async ( email, password, done) => {

        //   Login
        const user = await User.findOne({ email: email });            // Check email exists or not
        if(!user) {
            return done(null, false, { message: 'No user found with this email' })
        }

        if(user.isVerified !== true) {
            return done(null, false, { message: 'Email is not Verified' })
        }

        bcrypt.compare(password, user.password).then(match => {
            if(match) {
                return done(null, user, { message: 'Signed in successfully' });
            }
            
            return done(null, false, { message: 'Wrong username or password' });
        }).catch(err => {
            return done(null, false, { message: 'Something went wrong' });
        })

    }))

    passport.serializeUser((user, done) => {
        done(null, user._id );
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    })

}



module.exports = init