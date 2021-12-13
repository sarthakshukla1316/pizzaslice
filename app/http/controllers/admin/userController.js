const Feedback = require('../../../models/feedback');
const User = require('../../../models/user');

function userController() {
    return {
        async index(req, res) {

            const users = await User.find({ email: { $ne: 'sarthakshukla1317@gmail.com' } });
            // console.log(foods);
            return res.render('admin/users', { users: users});
            
        },

        async getFeedback(req, res) {
            const feedbacks = await Feedback.find();
            res.render('admin/feedback', { feedbacks: feedbacks});
        }
    }
}


module.exports = userController