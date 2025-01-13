const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let valid = users.filter((user) => {
        return user.username === username;
    });
    if (valid.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let authentic=users.filter((user)=>{
        return (user.username==username&&user.password==password);
    });
    if(authentic.length!=0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in, please try again." });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in!");
    } else {
        return res.status(208).json({ message: "Invalid Login, please check username and password and try again." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.body.review;

    if (books[isbn]){
        books[isbn].reviews[username] = review;
        res.send(`The review of the book with ISBN ${isbn} from user ${username} has been published.`);
    } else {
        res.send(`No books with ISBN ${isbn} were found in the database.`);
    }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    
    if (books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
        res.send(`The review of the book with ISBN ${isbn} from user ${username} has been deleted.`);
    } else {
        res.send(`No reviews with ISBN ${isbn} from user ${username} were found in the database.`);
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
