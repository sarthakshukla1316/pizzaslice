require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')


const PORT = process.env.PORT || 3300;


// Database Connection
const url = process.env.MONGO_CONNECTION_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Database connected'))
.catch(() => console.log('Connection failed'));




// Session Store
let mongoStore = MongoDbStore.create({
    mongoUrl: url,
    collection: 'sessions'
})



//    Event  emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter);



// Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }   // 24 hours
}));



// Passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());



// Flash
app.use(flash());


//  Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user
    next();
})


// set Template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


// Routes
require('./routes/web')(app);
app.use((req, res) => {
    res.status(404).render('errors/404');
})



// Invoking Server call
const server = app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
})




//     Socket io Section

const io = require('socket.io')(server)
io.on('connection', (socket) => {

    //  Join and make separate rooms
    socket.on('join', (roomName) => {
        socket.join(roomName);
    })

})


eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data);
})


eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data);
})