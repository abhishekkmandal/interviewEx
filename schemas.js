const Joi = require('joi');

module.exports.interviewSchema = Joi.object({
    interview: Joi.object({
        company: Joi.string().required(),
        jobtitle: Joi.string().required(),
        location: Joi.string().required(),
        jobtype: Joi.string().required(),
        placementdrive: Joi.string().required(),
        experience: Joi.string().required()
    }).required()
});

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    }).required()
})