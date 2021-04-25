const express = require('express');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myDatabase"
});

db.connect((err) => {
    if(err) throw err;
    console.log("mysql connected...")
})
const app = express();

app.use(express.json()); //apparently these are important
app.use(express.urlencoded({extended: false}));


require('./routes/products').get(app, db);

require('./routes/products').getById(app, db);

require('./routes/products').search(app, db);

require('./routes/cart').getForUser(app, db);

require('./routes/cart').modifyQuantity(app, db);

require('./routes/cart').add(app, db);

require('./routes/users').logIn(app, db);


app.listen("5001", () => {
    console.log("running on port 5001...");
});