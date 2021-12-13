const Feedback = require('../../../models/feedback');
const User = require('../../../models/user');

function userController() {
    return {
        async index(req, res) {

            const users = await User.find({ email: { $ne: 'sarthakshukla1317@gmail.com' } });
            // console.log(foods);
            return res.render('admin/users', { users: users});
            
        },

        async deleteUser(req, res) {
            let user = await User.findOne({ email: req.params.email });
            await user.delete();
            return res.redirect('/admin/users');
        },

        async getFeedback(req, res) {
            const feedbacks = await Feedback.find();
            res.render('admin/feedback', { feedbacks: feedbacks});
        },

        async deleteFeedback(req, res) {
            let feedback = await Feedback.findOne({ order_id: req.params.order_id });
            await feedback.delete();
            return res.redirect('/admin/feedback');
        }
    }
}


module.exports = userController