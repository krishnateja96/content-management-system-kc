const mongoose = require('mongoose');
const dompurify = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlpurify = dompurify(new JSDOM().window);
const { stripHtml } = require('string-strip-html');


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    snippet: {
        type: String
    },
    timeCreated: {
        type: Date,
        default: () => Date.now()
    },
    image: {
        type: String,
        default: "placeholder.jpg"
    }
});

blogSchema.pre('validate', function (next) {
    // console.log(this);
    if (this.description) {
        this.description = htmlpurify.sanitize(this.description);
        this.snippet = stripHtml(this.description.substring(0, 200)).result;
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);