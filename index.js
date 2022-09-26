let express = require('express');
let app = express();
// set public static Folder
app.use(express.static(__dirname + '/public'));
// user view Engine
let expressHbs = require('express-handlebars');
let helper = require('./controllers/helper');
let paginateHeper = require('express-handlebars-paginate');
let hbs = expressHbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions:{
        allowProtoPropertiesByDefault:true
    },
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        createStarList: helper.createStarList,
        cretedStars: helper.createdStars,
        createPagination: paginateHeper.createPagination
    }
});
app.engine('hbs', hbs.engine);  
app.set('view engine', 'hbs');

let bodyParser = require('body-parser');// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//use cookie parser
let cookieParser = require('cookie-parser');
app.use(cookieParser());

//use sesion
let sesion = require("express-session");
app.use(sesion({
    cookie: { httpOnly: true, maxAge:null},
    secret: 'S3cret',
    resave: false,
    saveUninitialized: false
}));

//user controller 
let Cart = require('./controllers/cartController');
app.use((req,res,next) => {
    var cart = new Cart(req.session.cart ? req.session.cart: {});
    req.session.cart = cart;
    res.locals.totalQuanlity = cart.totalQuantity;

    res.locals.fullname = req.session.user ? req.session.user.fullname: '';
    res.locals.isLoggedIn = req.session.user ? true : false;
    next();
});

// define your routes here
// / => index
// /products => category
// /product => single-product

// index.js => router/..router.js => controller//..controller.fs
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productRouter'));
app.use('/cart', require('./routes/cartRouter'));
app.use('/comments', require('./routes/commentRouter'));
app.use('/reviews', require('./routes/reviewRouter'));
app.use('/users', require('./routes/userRouter'));
app.get('/sync', (req,res) =>{
    let models = require('./models');
    models.sequelize.sync()
    .then(() =>{
        res.send(`database sync completed!`)
    });
});
app.get('/:page', (req, res) => {
    let banners = {
        blog: 'Our Blog',
        category: 'Shop Category',
        cart: 'Shopping cart',
        checkout: 'Product Checkout',
        confirmation: 'Order Confirmation',
        contact:'Contact Us',
        login: 'Login / Register',
        register: 'Register',
        singleblog: 'Blog Details',
        singleproduct: 'Shop Single',
        trackingoder: 'Order Tracking'
    };
    let page = req.params.page;
    res.render( page,{banner: banners[page]});
});

// set port and start server
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), () => {
    console.log(`Server is running at port ${app.get('port')}`)
});