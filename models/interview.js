const mongoose = require('mongoose');
const Comment = require('./comment');
const Schema = mongoose.Schema;

const interviewSchema = new Schema({
    company: {
        type: String,
        required: true
    },
    jobtitle: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobtype: {
        type: String,
        possibleValues: ['intern', 'fulltime'],
        required: true
    },
    placementdrive: {
        type: String,
        possibleValues: ['oncampus', 'offcampus'],
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

//middle ware to get what interview got deleted and delete the related comments
interviewSchema.post('findOneAndDelete', async function (doc) {
    //console.log(doc);
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Interview', interviewSchema);