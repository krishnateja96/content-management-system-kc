const express = require('express');
const Blog = require('./../models/Blog');
const router = express.Router();
const { check, validationResult } = require('express-validator');


router.get('/new', (req, res) => {
    if (req.session.userLoggedIn) {
        res.render('newblog', { isAdmin: req.session.userLoggedIn });
    } else {
        res.redirect('/login');
    }
});

router.get('/:id', async (req, res) => {
    // res.send(req.params.id);
    let blog = await Blog.findById(req.params.id);
    if (blog) {
        res.render('viewblog', { blog: blog, isAdmin: req.session.userLoggedIn });
    } else {
        res.redirect('/');
    }
});

router.post('/', [
    check('title', 'Title is required!').notEmpty(),
    check('slug', 'Slug is required!').notEmpty(),
    check('description', 'Description is required!').notEmpty()
], async (req, res) => {
    if (req.session.userLoggedIn) {
        const errors = validationResult(req);
        // console.log(req.body);
        if (!errors.isEmpty()) {
            res.render('errors', { errors: errors.array(), isAdmin: req.session.userLoggedIn });
        } else {
            let imgName = undefined;
            if (req.files && req.files.image) {
                imgName = Date.now() + req.files.image.name;
                const image = req.files.image;
                const imgPath = 'public/images/' + imgName;
                image.mv(imgPath, (err) => {
                    console.log(err);
                });
            }
            let blog = new Blog({
                title: req.body.title,
                slug: req.body.slug,
                description: req.body.description,
                image: imgName
            });
            try {
                blog = await blog.save();
                console.log(blog.id);
                res.redirect(`blogs/${blog.id}`);
            } catch (err) {
                console.log(err);
            }
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/edit/:id', async (req, res) => {
    if (req.session.userLoggedIn) {
        const blog = await Blog.findById(req.params.id);
        res.render('editblog', { blog: blog, isAdmin: req.session.userLoggedIn });
    } else {
        res.redirect('/login');
    }
});

router.put('/:id', [
    check('title', 'Title is required!').notEmpty(),
    check('slug', 'Slug is required!').notEmpty(),
    check('description', 'Description is required!').notEmpty()
], async (req, res) => {
    if (req.session.userLoggedIn) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('errors', { errors: errors.array(), id: req.params.id, isAdmin: req.session.userLoggedIn });
        } else {
            // console.log(req.body);
            const blog = await Blog.findById(req.params.id);
            blog.title = req.body.title;
            blog.slug = req.body.slug,
            blog.description = req.body.description;

            try {
                await blog.save();
            } catch (err) {
                console.log(err);
            }
            res.redirect('/');
        }
    } else {
        res.redirect('/login');
    }
});

router.delete('/:id', async (req, res) => {
    // console.log(req.body);
    if (req.session.userLoggedIn) {
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;