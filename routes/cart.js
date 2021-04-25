
const getForUser = (app, db) =>{ 
    app.post("/api/cart", (request, response) => { //either this thing or the cart route are too flaky, I have to write tests for them
        console.log(request.body.id)
        id = request.body.id;

        fetchCart(id, response, db);

    });
}

const modifyQuantity = (app, db) =>{
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
            fetchCart(request.body.userId, response, db)
        });
    });
}

const add = (app, db) => {
    app.post("/api/cart/add", (request, response) => {
        let sql = "SELECT * FROM cart";
        db.query(sql, (err, result) => {
            if(err) throw err;
            console.log("add to cart request was made")
            console.log(result);

            const allCarts = result;

            const latestCart = findLatestCartFromUser(request.body.userId, allCarts);

            console.log("added product id:    " + request.body.productId);

            const similarItems = latestCart.filter((record => record.productId == request.body.productId)); // == because id types may not be the same

            console.log(similarItems)

            console.log("+++latest cart before +++ :    " + latestCart)

            if(similarItems.length > 0){
                const addToCartId = similarItems[0].addToCartId;
                const newSql = "UPDATE cart SET quantity = quantity + 1 WHERE addToCartId = " + addToCartId;
                db.query(newSql, (err, result) => {
                    if(err) throw err;

                    response.send(result);
                });
            } else {
                console.log("+++latest cart+++ :    " + latestCart)
                const newAddToCartId = createNewCartAdditionId(allCarts);
                console.log(newAddToCartId);

                const latestCartId = latestCart[0].cartId; //any element will do, they all have the same id
                const addRecordSQL = `
                    INSERT INTO cart
                        (addToCartId, cartId, userId, orderDate, productId, quantity)
                    VALUES
                        (${newAddToCartId}, ${latestCartId}, ${request.body.userId}, 666, ${request.body.productId}, 1)
                `

                console.log("the add sql is:     " + addRecordSQL);

                db.query(addRecordSQL, (err, result) => {
                    if(err) throw err;

                    response.send("new item kind added to cart")
                });
            }
        });
    });
}


//helpers
const fetchCart = (userId, response, db) => {
    if(userId && userId >= 0){
        let sql = "SELECT * FROM cart";
        db.query(sql, (err, cartResult) => {
            if(err) throw err;
            console.log(cartResult);

            const latestCartOfItems = findLatestCartFromUser(userId, cartResult);

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
        response.send("server: not logged in"); //in the future I should make it that the user doesn't have to be logged in
    }
}

const findLatestCartFromUser = (userId, cartData) => { //needs to determine if the cart is active, even if it's the latest (could be from old login)
    const cartedItemsFromUser = cartData.filter(item => item.userId == userId); // == because not same type
    const sortedItems = cartedItemsFromUser.sort((a, b) => a.cartId - b.cartId);
    const highestCartId = sortedItems[sortedItems.length - 1].cartId; 
    const latestCartOfItems = sortedItems.filter(item => item.cartId === highestCartId); 
    return latestCartOfItems;
}

const createNewCartAdditionId = (cartData) => {
    console.log("cart data:   " + cartData)
    const sortedByAdToCartId = cartData.sort((a, b) => a.addToCartId - b.addToCartId);
    console.log("sorted purchases:    " + sortedByAdToCartId);
    const index = sortedByAdToCartId.length - 1;
    const latestPurchaseId = sortedByAdToCartId[index].addToCartId;
    return latestPurchaseId + 1;
}



module.exports.getForUser = getForUser;
module.exports.modifyQuantity = modifyQuantity;
module.exports.add = add;