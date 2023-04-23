const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const comment = req.body.comment;
    let book = books[isbn];
    if(book) {
        keys = Object.keys(book.reviews);
        let message = "Review successfully "
        if ((keys.length > 0) && (book.reviews[username])) {
            message += "updated";
        } else {
            message += "added";
        }
        book.reviews[username] = comment;
        res.send(message);
    } else {
        res.send("Unable to find book!")
    }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    let book = books[isbn];
    if(book) {
        keys = Object.keys(book.reviews);
        let message = ""
        if ((keys.length > 0) && (book.reviews[username])) {
            message += "Review successfully deleted";
        } else {
            message += "You can only delete your own reviews";
        }
        delete book.reviews[username];
        res.send(message);
    } else {
        res.send("Unable to find book!")
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
