const express = require('express');
const router = express.Router({ mergeParams: true });

const Interview = require('../models/interview');
const Comment = require('../models/comment');

const { commentSchema } = require('../schemas.js');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { isLoggedIn, validateComment, isCommentAuthor } = require('../middleware');



router.post('/', isLoggedIn, validateComment, catchAsync(async (req, res) => {
    const interview = await Interview.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    //console.log(comment);
    comment.author = req.user._id;
    interview.comments.push(comment);
    await comment.save();
    await interview.save();
    req.flash('success', 'Created new comment');
    res.redirect(`/interviews/${interview._id}`);
}))

router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    //deleting with the help of pull
    await Interview.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted comment');
    res.redirect(`/interviews/${id}`);
}))

module.exports = router;