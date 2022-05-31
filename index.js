const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const blogRouter = require('./routes/blogs');
const Blog = require('./models/Blog');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const Admin = require('./models/Admin');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(fileUpload());
app.use(session({
    secret: "thisissomerandomsecret",
    resave: false,
    saveUninitialized: true
}));
app.use('/blogs', blogRouter);

mongoose.connect('mongodb://localhost:27017/content-management-system', {
    UseNewUrlParser: true,
    UseUnifiedTopology: true
});


app.listen(3000, async () => {
    // const admin = new Admin({
    //     username: 'admin',
    //     password: 'password'
    // });
    // await admin.save();
    console.log('App started on 3000!');
});

app.get('/', async (req, res) => {
    const blogs = await Blog.find({});
    res.render('home', { blogs: blogs, isAdmin: req.session.userLoggedIn });
});

app.get('/login', (req, res) => {
    if (req.session.userLoggedIn) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

app.post('/login', async (req, res) => {
    const admin = await Admin.findOne({ username: req.body.username, password: req.body.password });
    if (admin) {
        req.session.userLoggedIn = true;
        req.session.username = admin.username;
        res.redirect('/');
    } else {
        res.render('login', {msg : "Login Failed. Please try again!"});
    }
});

app.get('/logout', (req, res) => {
    req.session.username = '';
    req.session.userLoggedIn = false;
    res.redirect('/');
});
