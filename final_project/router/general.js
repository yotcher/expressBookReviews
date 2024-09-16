const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('https://yotcher-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai');
        res.status(200).send(JSON.stringify(books, null, 4));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book list', error: error.message });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = res.params.isbn;
    try {
        const response = await axios.get(`https://yotcher-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/${isbn}`);
        res.status(200).send(JSON.stringify(books[isbn], null, 4));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book list', error: error.message });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const response = await axios.get(`https://yotcher-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
        const filteredAuthors = Object.values(books).filter(book => book.author === author);
        if (filteredAuthors.length) {
            res.send(filteredAuthors);
        } else {
            res.status(404).send("book not found");
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});


// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try {
        const title = req.params.title;
        const response = await axios.get(`https://yotcher-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${title}`);
        const filteredTitles = Object.values(books).filter(book => book.title === title);
        if (filteredTitles.length) {
            res.send(filteredTitles);
        } else {
            res.status(404).send("book not found");
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
