const Feedback = require('../../../models/feedback');
const mailSender = require('./mailSender');

function feedbackController() {
    return {
        showFeedback(req, res) {
            res.render('customers/feedback', {order_id: req.params.order_id});
        },

        async saveFeedback(req, res) {
            const { order_id, quality, clean, speed, overall, comment } = req.body;
            const {name, email, phone} = req.user;

            if(!order_id || !comment) {
                req.flash('error', 'Please fill all details');
                req.flash('order_id', order_id);
                req.flash('comment', comment);
                return res.redirect('/customer/feedback');
            }

            Feedback.exists({ order_id: order_id }, async (err, result) => {         //   Check order feedback exists or not in DB
                if(result) {
                    req.flash('error', 'Feedback already exists');
                    req.flash('order_id', order_id);
                    req.flash('comment', comment);
                    return res.redirect('/customer/feedback');
                }
            })
            
            let feedback = new Feedback({
                order_id: order_id,
                name: name,
                email: email,
                phone: phone,
                quality: quality,
                clean: clean,
                speed: speed,
                overall: overall,
                comment: comment
            });


            await feedback.save().then((feedback) => {
                req.flash('success', 'Your feedback has been submitted successfully');
                return res.redirect('/customer/orders');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                req.flash('order_id', order_id);
                req.flash('comment', comment);
                return res.redirect('/customer/feedback');
            })
        },

        async contact(req, res) {
            const { name, email, subject, message } = req.body;

            let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 20px;">${subject}</h1>
                    </div>
                    <h3>This message is from ${name} and email ${email} <br /> </h3>
                    <p>${message}</p>
                `;
                const subjectCustomer = subject;
                const toEmailCustomer = 'sarthakshukla1317@gmail.com';
                mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

            let markupCustomer1 = `
                <div style="height: 50px; width: 100%; background: #59b256">
                    <h2 style="color: #fff; text-align: center; padding-top: 20px;">Response Message</h2>
                </div>
                <h3>This message is from Admin of PizzaaSlice <br /> </h3>
                <p>Our team has received your email and will contact you shortly.</p>
            `;
            const subjectCustomer1 = 'PizzaaSlice Team Support';
            const toEmailCustomer1 = email;
            mailSender(toEmailCustomer1, markupCustomer1, subjectCustomer1);

            req.flash('success', 'Email has been sent. Our team will get in touch with you shortly.');
            return res.redirect('/');
        }
    }
}


module.exports = feedbackController