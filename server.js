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

app.get("/api/products", (req, res) => {
    let sql = "SELECT * FROM products";
    db.query(sql, (err, result) => {
        if(err) throw err;
        //console.log(result);
        res.json(result);
    });
});

app.get("/api/products/:id", (request, response) => {
    const reqId = request.params.id;
    let sql = "SELECT " + reqId + " FROM products";
    db.query(sql, (err, result) => {
        if(err) throw err;
        response.json(result);
    });
});

//app.get("/api/products/")

app.post("/api/cart", (request, response) => { //either this thing or the cart route are too flaky, I have to write tests for them
    console.log(request.body)
    id = request.body.id;
    console.log("logged in ID is     " + id);

    fetchCart(id, response);

});

app.post("/api/cart/modify", (request, response) => {
    const addToCartId = request.body.addToCartId;
    const quantity = request.body.quantity;
    const absQuantity = Math.abs(quantity);
    let signString = "+";
    if(Math.sign(quantity) === -1) signString = "-"; //side effect!
    let sql = "UPDATE cart SET quantity = quantity " + signString + absQuantity + " WHERE addToCartId = " + addToCartId;
    console.log(sql);
    db.query(sql, (err, result) => {
        if(err) throw err;
    });
});

app.post("/api/authentication", (request, response) => {

    const email = request.body.email;
    const password = request.body.password;

    if(email && password){
        let sql = "SELECT email, loggedIn, id FROM users"; 
        db.query(sql, (err, result) => {
            if(err) throw err;
            const requestingUserArray = result.filter(user => user.email === email);
            if(requestingUserArray.length){
                const index = result.indexOf(requestingUserArray[0]);
                //result[index].loggedIn = true.toString(); //has to be a string I think
                const id = result[index].id;
                //console.log(result)

                let newSql = "UPDATE users SET loggedIn = 'true' WHERE id = " + id;
                db.query(newSql, (err, newResult) => {
                    if(err) throw err;

                });

                response.send({id: id, loggedIn: true});
            } else {
            }
        });
        //response.end(); //no idea what this does
    } else {
        response.end();
    }
});


//helpers
const fetchCart = (userId, response) => {
    if(userId && userId >= 0){
        let sql = "SELECT * FROM cart";
        db.query(sql, (err, cartResult) => {
            if(err) throw err;
            console.log(cartResult);

            const cartedItemsFromUser = cartResult.filter(item => item.userId == userId); // == because not same type
            const sortedItems = cartedItemsFromUser.sort((a, b) => a.cartId - b.cartId);
            const highestCartId = sortedItems[sortedItems.length - 1].cartId; //boy these arrays better not be empty
            const latestCartOfItems = sortedItems.filter(item => item.cartId === highestCartId); //I should probably use the unsorted array for authenticity

            let productSql = "SELECT id, title, price, discount, image FROM products";
            db.query(productSql, (err, productsResult) => {
                if(err) throw err;

                const usefulCartData = latestCartOfItems.map(cartItem => {
                    const cartProductArray = productsResult.filter(productItem => productItem.id == cartItem.productId); //not ===
                    const usefulCartItem = {
                        quantity: cartItem.quantity, 
                        addToCartId: cartItem.addToCartId
                    }
                    const finalCartProduct = {...cartProductArray[0], ...usefulCartItem};
                    return finalCartProduct;
                });

                console.log(usefulCartData);
                response.send(usefulCartData);
            });
        });
    } else {
        response.end();
    }
}



app.listen("5001", () => {
    console.log("running on port 5001...");
});