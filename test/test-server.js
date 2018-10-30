const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server')

const should = chai.should();

describe('Blog Post', function(){
	before(function() {
		return runServer();
	});
});

after(function() {
	return closeServer();
});

it('should list blog posts on GET', function() {
	return chai
	.request(app)
	.get('/blog')
	.then(function (res) {
		res.should.have.status(400);
		res.should.be.json;
		res.body.should.be.a('array')

		res.body.should.have.length.of.at.least(1);

		res.body.forEach(function (item) {
			item.should.be.a('object');
			item.should.include.keys
			(
				'id',
				'title',
				'content',
				'author', 
				'publishDate'
				);
		});
	});
}); //end GET

it('should add a blog post on POST', function () {
	const newBlogPost = {
		title: 'post title', 
		content: 'add some content.',
		author:'Sally Student' 
	};
	const expectedKeys = ["id", "publishDate"].concat(Object.keys(newBlogPost));

	return chai
	.request(app)
	.post('/blog')
	.send(newBlogPost)
	.then(function (res) {
		res.should.have.status(201);
		res.should.be.json;
		res.body.should.be.a('object');
		res.body.should.include.keys('id','title','content','author', 'publishDate');
		res.body.should.equal(newBlogPost.content);
		res.body.should.equal(newBlogPost.title);
		res.body.author.should.equal(newBlogPost.author);
		
	});
});


