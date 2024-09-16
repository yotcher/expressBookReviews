const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    relUsers = users.filter(user => user.username === username);
    return (relUsers.length > 0);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
      });
      return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
        data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
        accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Get the username from the session
    const username = req.session.authorization?.username;

    // Check if user is logged in
    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    // Check if the ISBN exists in the books object
    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Check if review is provided in the query
    if (!review) {
        return res.status(400).json({ message: 'Review text is missing' });
    }

    // If the reviews object does not exist for the book, create it
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or modify the review for the current user
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review successfully added or modified',
        reviews: books[isbn].reviews
    });
});

regd_users.get("/", (req, res) => {
    res.send(JSON.stringify(books));
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Get the username from the session
    const username = req.session.authorization?.username;

    // Check if user is logged in
    if (!username) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    // Check if the ISBN exists in the books object
    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // If the reviews object does not exist for the book, create it
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or modify the review for the current user
    books[isbn].reviews[username] = {};

    return res.status(200).json({
        message: 'Review successfully removed',
        reviews: books[isbn].reviews
    });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
