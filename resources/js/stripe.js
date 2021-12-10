import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from './apiService';
import { CardWidget } from './CardWidget';


export async function initStripe() {

    const stripe = await loadStripe('pk_test_51JJdXiSFC2ysPpAcbFr2KjooBXuMHHzexqTBU93DDd4xncUSMMVJzuWkr4gjtSYWulK7n2qlFZ1EH1LGbiX10kox00YIBvtTgq');

    let card = null;

    // function mountWidget() {
    //     const elements = stripe.elements();

    //     let style = {
    //         base: {
    //         color: '#32325d',
    //         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //         fontSmoothing: 'antialiased',
    //         fontSize: '16px',
    //         '::placeholder': {
    //             color: '#aab7c4'
    //         }
    //         },
    //         invalid: {
    //         color: '#fa755a',
    //         iconColor: '#fa755a'
    //         }
    //     }

    //     card = elements.create('card', { style: style, hidePostalCode: true });
    //     card.mount('#card-element');
    // }




    const paymentType = document.querySelector('#paymentType');
    if(!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if(e.target.value === 'card') {
            //   Display Widget

            card = new CardWidget(stripe);
            card.mount();

            // mountWidget();
        } else {
            card.destroy();
        }
    })


    //    Ajax call
    const paymentForm = document.querySelector('#payment-form');
    if(paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
        
            let formData = new FormData(paymentForm);          // Inbuilt class of js to fetch form details submitted
            let formObject = {};
        
            for(let [key, value] of formData.entries()) {
                formObject[key] = value;
            }



            //   cash on delivery

            if(!card) {
                //   Ajax  call

                placeOrder(formObject);
                return;
            }



            const token = await card.createToken();

            formObject.stripeToken = token.id;
            // formObject.user = user;
            placeOrder(formObject);



            //  Pay with card

            //   Verify card details from stripe (request to stripe)
            // stripe.createToken(card).then((result) => {
            //     // console.log(result);

            //     formObject.stripeToken = result.token.id;
            //     placeOrder(formObject);
            // }).catch(err => {
            //     console.log(err);
            // })


        
        })
    }

}

