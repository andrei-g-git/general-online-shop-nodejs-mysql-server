const { request, response } = require("express");

const get = (app, db) => {
    app.get("/api/products", (req, res) => {
        let sql = "SELECT * FROM products";
        db.query(sql, (err, result) => {
            if(err) throw err;
            res.json(result);
        });
    });    
}

const getById = (app, db) => {
    app.get("/api/products/:id", (request, response) => {
        const reqId = request.params.id;
        let sql = "SELECT " + reqId + " FROM products";
        db.query(sql, (err, result) => {
            if(err) throw err;
            response.json(result);
        });
    });
}

const search = (app, db) => { //this only works for exact words for now (e.g. if query is "women's" it won't return titles that contain "women")
    app.post("/api/products/search", (request, response) => {
        const searchString = request.body.title;
        console.log(searchString + "     " + typeof searchString);
        sql = `
            SELECT id 
            FROM products
            WHERE MATCH(title)
            AGAINST("${searchString}")
        ` //gotta have quotes around the $variable even it's value is a string ... dunno... AND MAKE SURE THEY'RE DIFFERENT FROM ONES INSIDE TEH STRING LIKE APOSTROPHES
        db.query(sql, (err, result) => {
            if(err) throw err;

            console.log(result);

            response.send(result);
        });
    });
}

module.exports.get = get;
module.exports.getById = getById;
module.exports.search = search;