/*if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}*/

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
//to fake put,patch,delete from form 
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const interviewRoutes = require('./routes/interviews');
const commentRoutes = require('./routes/comments');

const MongoDBStore = require("connect-mongo");

//const dbUrl = process.env.DB_URL || 'mongodb+srv://abhishek123:abhishek123@interviewex.nkexl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
//const dbUrl = 'mongodb://localhost:27017/interviewEx';
//const dbUrl = 'mongodb+srv://abhishek123:abhishek123@cluster0.ctegg.mongodb.net/interviewex?retryWrites=true&w=majority'
const dbUrl = process.env.DB_URL || 'mongodb+srv://abhishek123:abhishek123@cluster0.ctegg.mongodb.net/interviewex?retryWrites=true&w=majority';


mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });

//logic check for mongoose connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//to parse the body
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || '100mysecret100';
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("Session store ERROR", e);
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//middleware so that we dont have to pass anything to our templates, we will always have access to something called success etc
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/interviews', interviewRoutes);
app.use('/interviews/:id/comments', commentRoutes);


app.get('/', (req, res) => {
    res.render('home');
});

//if we hit some url we dont recognise
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no Something went Wrong!';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});