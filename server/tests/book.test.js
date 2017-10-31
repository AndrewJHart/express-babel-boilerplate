import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import faker from 'faker';
import app from '../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Book APIs', () => {
  let user = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  };

  let book = {
    bookName: faker.name.findName(),
    author: faker.name.findName(),
    // isbn: faker.random.alphaNumeric(11),
    isbn: Math.random().toString(36).substr(11, 13)
  };

  describe('# POST /auth/register', () => {
    it('should create a new user for creating book', (done) => {
      request(app)
        .post('/auth/register')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.token).to.not.equal('');
          expect(res.body.token).to.not.equal(undefined);
          expect(res.body.user.email).to.equal(user.email);
          expect(res.body.user.firstName).to.equal(user.firstName);
          expect(res.body.user.lastName).to.equal(user.lastName);
          expect(res.body.user.password).to.equal(undefined); // Password should be removed.
          user = res.body.user;
          user.token = res.body.token;
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/books', () => {
    it('should create a new book', (done) => {
      book.owner = user._id; // Setting created user as owner.
      request(app)
        .post('/api/books')
        .send(book)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner).to.equal(book.owner);
          expect(res.body.bookName).to.equal(book.bookName);
          expect(res.body.author).to.equal(book.author);
          expect(res.body.isbn).to.equal(book.isbn);
          book = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/books/:bookId', () => {
    it('should get book details', (done) => {
      request(app)
        .get(`/api/books/${book._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.bookName).to.equal(book.bookName);
          expect(res.body.author).to.equal(book.author);
          expect(res.body.isbn).to.equal(book.isbn);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when book does not exists', (done) => {
      request(app)
        .get('/api/books/56c787ccc67fc16ccc1a5e92')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.equal('No such book exists!');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/books/:bookId', () => {
    it('should update book details', (done) => {
      book.bookName = faker.name.findName();
      request(app)
        .put(`/api/books/${book._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .send(book)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.bookName).to.equal(book.bookName);
          expect(res.body.author).to.equal(book.author);
          expect(res.body.isbn).to.equal(book.isbn);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/books/', () => {
    it('should get all books', (done) => {
      request(app)
        .get('/api/books')
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/books/', () => {
    it('should delete book', (done) => {
      request(app)
        .delete(`/api/books/${book._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.owner._id).to.equal(user._id);
          expect(res.body.bookName).to.equal(book.bookName);
          expect(res.body.author).to.equal(book.author);
          expect(res.body.isbn).to.equal(book.isbn);
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    it('should handle express validation error - isbn is required', (done) => {
      request(app)
        .post('/api/books')
        .send({
          bookName: faker.name.findName(),
          author: faker.name.findName(),
          owner: user._id
        })
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.error).to.equal('"isbn" is required');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user after done with books testing', (done) => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .set({ Authorization: `Bearer ${user.token}` })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(user.email);
          expect(res.body.firstName).to.equal(user.firstName);
          expect(res.body.lastName).to.equal(user.lastName);
          expect(res.body.password).to.equal(undefined); // Password should be removed.
          done();
        })
        .catch(done);
    });
  });
});
