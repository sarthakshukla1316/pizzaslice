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
        },

        sendEmail(req, res) {
            res.render('admin/sendEmail', { email: req.params.email});
        },

        async postSendEmail(req, res) {
            const { email, comment } = req.body;
            if(!email || !comment) {
                req.flash('error', 'Please fill all details');
                req.flash('email', email);
                req.flash('comment', comment);
            }

            let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 15px;">Response message</h1>
                    </div>
                    <p>${comment}</p>
            `;
            const subjectCustomer = 'Pizza Slice Team';
            const toEmailCustomer = email;
            mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

            return res.redirect('/admin/users');
        }
    }
}


module.exports = userController