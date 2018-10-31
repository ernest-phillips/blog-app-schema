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

//GET Authors
app.get('/authors', (req, res) => {
    Author
        .find()
        .then(authors => {
            res.json(authors.map(author => {
                return {
                    id: author._id,
                    name: `${author.firstName} ${author.lastName}`,
                    userName: author.userName
                };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went wrong' });
        });
})

app.post('/authors', (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    Author
        .findOne({ userName: req.body.userName })
        .then(author => {
            if (author) {
                const message = `Username already taken`;
                console.error(message);
                return res.status(400).send(message);
            } else {
                Author
                    .create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        userName: req.body.userName
                    })
                    .then(author => res.status(201).json({
                        _id: author.id,
                        name: `${author.firstName} ${author.lastName}`,
                        userName: author.userName
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'Something went wrong' });
                    });
            }
        })
        .catch(err => {
            ConstantSourceNode.error(err);
            res.status(500).json({ error: 'something went horribly wrong' });
        });
});
/////////////////////////////////////
app.put('/authors/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }
    const updated = {};
    const updatedableFields = ['firstName', 'lastName', 'userName'];
    updatedableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });


    Author
        .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
        .then(author => {
            if (author) {
                const message = `Username already taken`;
                console.error(message);
                return res.status(400).send(message);
            } else {
                Author
                    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
                    .then(updatedAuthor => {
                        res.status(200).json({
                            id: updatedAuthor.id,
                            name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                            userName: updatedAuthor.userName
                        });
                    })
                    .catch(err => res.status(500).json({ message: err }));
            }
        });
});

app.delete('/authors/:id', (req, res) => {
    BlogPost
        .remove({ author: req.params.id })
        .then(() => {
            Author
                .findByIdAndRemove(req.params.id)
                .then(() => {
                    console.log(`Deleted blog posts owned by an author with id \`${req.params.id}\``);
                    res.status(204).json({ message: 'success' });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went wrong' });
        });
});


app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .then(posts => {
            res.json(posts.map(post => {
                return {
                    id: post._id,
                    author: post.authorName,
                    content: post.content,
                    title: post.title
                };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went terribly wrong' });
        });
});


//READ
app.get('/posts/:id', (req, res) => {
    BlogPost

        .find()
        .then(post => {
            res.json(posts.map(post => {
                return {
                    id: post._id,
                    author: post.authorName,
                    content: post.content,
                    title: post.title
                };
            }));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went very bad.' });
        });
});

//CREATE
app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message); //log error message to console
            //The request could not be understood by the server 
            //due to malformed syntax. 
            return res.status(400).send(message);
        }
    })

    Author
        .findById(req.body.author_id)
        .then(author => {
            if (author) {
                BlogPost
                    .create({
                        title: req.body.title,
                        content: req.body.content,
                        author: req.body.id
                    })
                    .then(blogPost => res.status(201).json({
                        id: blogPost.id,
                        author: `${author.firstName} ${author.lastName}`,
                        content: blogPost.content,
                        title: blogPost.title,
                        comments: blogPost.comments
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'Something went wrong' });
                    });
            } else {
                const message = `Author not found`;
                console.error(message);
                return res.status(400).send(message);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went horribly awry' });
        });

});
//***********************
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
        .then(updatedPost => res.status(200).json({
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content
        }))
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

//DELETE
app.delete('/posts/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleted blog post with id \`${req.params.id}\``);
            res.status(204).end();
        });
});
// Why couldn't arrow function be used here?
//What does the asterisk do here?
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



//DELETE Deprecated code
// app.delete('/posts/:id', (req, res) => {
//     BlogPost
//         .findByIdAndRemove(req.params.id)
//         .then(() => {
//             res.status(204).json({ message: 'success' });
//             //The server has fulfilled the request but does not need to return an entity-body
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({ error: 'something went terribly wrong' });
//         });
// });

//UPDATE