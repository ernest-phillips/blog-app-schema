'use strict';
// tell the server we need these dependencies
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//location of our port and database url
const { PORT, DATABASE_URL } = require("./config");
const { BlogPosts } = require("./models");

const app = express();

app.use(morgan('common'));
app.use(express.json());

app.get('/posts', (req, res) => {
    BlogPost
        .findOne(req.title)
        .populate('author')
        .then(posts => {
            res.json(posts.map(post => post.serialize()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went terribly wrong' });
        });
});
//READ
app.get('/posts/:id', (req, res) => {
    BlogPost

        .findById(req.params.id)
        .then(post => res.json(post.serialze()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went very bad.' });
        });
});

//CREATE
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i]; //iterate through list and assign to new list
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message); //log error message to console
            //The request could not be understood by the server 
            //due to malformed syntax. 
            return res.status(400).send(message);
        }
    }

    BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        //The request has been fulfilled and resulted in a new resource being created. 
        .then(blogPost => res.status(201).json(blogPost.serialize()))
        .catch(err => {
            res.status(500).json({ error: 'Something went wrong' });
        });

});

//DELETE
app.delete('/posts/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({ message: 'success' });
            //The server has fulfilled the request but does not need to return an entity-body
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
        });
});

//UPDATE
app.put('/posts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }
    const updated = {};
    const updatedableFields = ['title', 'content', 'author'];
    updatedableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    BlogPost //////what is the $set here?
    //https://docs.mongodb.com/manual/reference/operator/update/set/
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedPost => res.status(204))
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//DELETE
app.delete('/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted blog post with id \`${req.params.id}\``);
            res.status(204).end();
        });
});
// Why couldn't arrow function be used here?
app.use('*', function(req, res) {
    res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(databaseUrl, port = PORT) {
    //how do the paramaters resolve and reject work?
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        })
    })
}


if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };