const order = require('../../../models/order');
const User = require('../../../models/user');

function profileController() {
    return {
        async index(req, res) {

            const user = await User.findOne({ email: req.params.email});
            // console.log(foods);
            return res.render('customers/profile', { user: user });
            
        },

        async update(req, res) {
            const { name, newName, email, phone } = req.body;
            
            if(!name || !newName || !email || !phone) {         //  Validate user data
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                req.flash('phone', phone);
                return res.redirect(`/profile/${email}`);
            }

            if(req.file) {
                await User.updateOne({ email: req.body.email }, { name: req.body.newName, image: req.file.filename }, async (err, data) => {
                    if(err) {
                        req.flash('error', 'Not able to update profile Status');
                        return res.redirect('/');
                    }
    
                    req.flash('success', 'Profile has been updated successfully');
                    return res.redirect(`/profile/${email}`);
                })
            } else {
                await User.updateOne({ email: req.body.email }, { name: req.body.newName }, async (err, data) => {
                    if(err) {
                        req.flash('error', 'Not able to update profile Status');
                        return res.redirect('/');
                    }
    
                    req.flash('success', 'Profile has been updated successfully');
                    return res.redirect(`/profile/${email}`);
                })
            }

            
        },

        async deleteAccount(req, res) {

            await User.findByIdAndDelete({ _id: req.user._id});

            req.logout();

            return res.redirect('/');
        }
    }
}



module.exports = profileController