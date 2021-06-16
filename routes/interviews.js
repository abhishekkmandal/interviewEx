const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Interview = require('../models/interview');
const { isLoggedIn, isAuthor, validateInterview } = require('../middleware');


router.get('/', catchAsync(async (req, res) => {
    const interviews = await Interview.find({});
    res.render('interviews/index', { interviews });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('interviews/new');
});

router.post('/', isLoggedIn, validateInterview, catchAsync(async (req, res, next) => {
    //if (!req.body.interview) throw new ExpressError('Invalid Interview data', 400);
    const interview = new Interview(req.body.interview);
    interview.author = req.user._id;
    await interview.save();
    req.flash('success', 'Successfully made a new interview');
    res.redirect(`/interviews/${interview._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const interview = await Interview.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');

    //console.log(interview);
    if (!interview) {
        req.flash('error', 'Cannot find that interview');
        return res.redirect('/interviews');
    }
    res.render('interviews/show', { interview });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
        req.flash('error', 'Cannot find that interview');
        return res.redirect('/interviews');
    }
    res.render('interviews/edit', { interview });
}));

router.put('/:id', isLoggedIn, isAuthor, validateInterview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const interview = await Interview.findByIdAndUpdate(id, { ...req.body.interview });
    req.flash('success', 'Successfully updated interview');
    res.redirect(`/interviews/${interview._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Interview.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted interview');
    res.redirect('/interviews');
}));

module.exports = router;