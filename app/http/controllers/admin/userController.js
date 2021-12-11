const User = require('../../../models/user');

function userController() {
    return {
        async index(req, res) {

            const users = await User.find({ email: { $ne: 'sarthakshukla1317@gmail.com' } });
            // console.log(foods);
            return res.render('admin/users', { users: users});
            
        }
    }
}


module.exports = userController