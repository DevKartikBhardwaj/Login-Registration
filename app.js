const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const app = express();
const port = process.env.PORT || 80;

main().catch((err) => { console.log(err); })

async function main() {
    await mongoose.connect("mongodb://localhost:27017/Bookish");
}

//creating a schema
var bookishSchema = new mongoose.Schema({
    name: String,
    mobile: Number,
    Email: String,
    Password: String
})

bookishSchema.pre("save", async function (next) {
    this.Password = await bcrypt.hash(this.Password, 10);

    next();
})

var bookish = mongoose.model('bookish', bookishSchema);



app.use('/static', express.static('static'));
app.use(express.urlencoded());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/register', (req, res) => {
    res.status(200).render('registration');
})
app.post('/register', (req, res) => {
    const password = req.body.Password;
    const cpassword = req.body.cPassword;
    if (password === cpassword) {
        var bookishDoc = new bookish(req.body);
        bookishDoc.save((err) => {
            if (err) {
                return console.error(err);
            }
        })

        res.status(200).render('registration');
    } else {
        res.send("Something is wrong in registration form");
    }
})
app.get('/login', (req, res) => {

    res.status(200).render('login');
})

app.post("/login", async (req, res) => {
    try {
        const email = req.body.Email;
        const password = req.body.Password;

        const userMail = await bookish.findOne({ Email: email });

        if (await bcrypt.compare(password, userMail.Password)) {
            res.status(200).render('index');
        } else {
            res.send("invalid login details");
        }
    } catch (error) {
        res.send("invalid logins details");
    }
})

app.listen(port, () => {
    console.log("app is succesfully running");
})