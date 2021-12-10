import axios from 'axios';
import moment from 'moment';
import Noty from 'noty';
import { initAdmin } from './admin';
import { initStripe } from './stripe';


let addToCart = document.querySelectorAll('.add-to-cart');
// let deleteFromCart = document.querySelectorAll('.delete-from-cart');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(food) {
    axios.post('/update-cart', food).then(res => {
        // console.log(res);
        cartCounter.innerText = res.data.totalQty;

        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item Added to Cart',
            progressBar: false
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {

        let food = JSON.parse(btn.dataset.food);
        updateCart(food);
        // console.log(food);
    })
})




// admin section 
// delete food

// let deleteFood = document.querySelectorAll('.delete-food');

// function deleteFood(food) {
//     axios.post('/delete-food', food).then(res => {
//         new Noty({
//             type: 'success',
//             timeout: 1000,
//             text: 'Item deleted from Menu',
//             progressBar: false
//         }).show();
//     }).catch(err => {
//         new Noty({
//             type: 'error',
//             timeout: 1000,
//             text: 'Something went wrong',
//             progressBar: false
//         }).show();
//     })
// }

// deleteFood.forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//         let food = JSON.parse(btn.dataset.food);

//         deleteFood(food);
//     })
// })






// function deleteCart(foodId) {
//     axios.post('/delete-cart', foodId).then(res => {
//         // console.log(res);

//         new Noty({
//             type: 'success',
//             timeout: 1000,
//             text: 'Item deleted from Cart',
//             progressBar: false
//         }).show();
//     }).catch(err => {
//         new Noty({
//             type: 'error',
//             timeout: 1000,
//             text: 'Something went wrong',
//             progressBar: false
//         }).show();
//     })
// }

// deleteFromCart.forEach((btn) => {
//     btn.addEventListener('click', (e) => {

//         let foodId = btn.dataset.id;
//         deleteCart(foodId);
//     })
// })






//   Remove alert message after few seconds
const alertMsg = document.querySelector('#success-alert');
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000);
}




//  Change order status dynamically

let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order) {

    statuses.forEach(status => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })

    let stepCompleted = true;

    statuses.forEach(status => {
        let dataProp = status.dataset.status;
        if(stepCompleted) {
            status.classList.add('step-completed');
        }

        if(dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);
            if(status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    })
}

updateStatus(order);



// Payment section
initStripe();




// Socket section

let socket = io()


//  Join 
if(order) {
    socket.emit('join', `order_${order._id}`);
}


let adminAreaPath = window.location.pathname;
if(adminAreaPath.includes('admin')) {
    //   Admin Section
    initAdmin(socket);
    
    socket.emit('join', 'adminRoom');
}


socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    
    updateStatus(updatedOrder);
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order has been updated',
        progressBar: false
    }).show();
})