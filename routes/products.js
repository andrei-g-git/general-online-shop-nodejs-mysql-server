const get = (app, db) => {
    app.get("/api/products", (req, res) => {
        let sql = "SELECT * FROM products";
        console.log("hello from get")
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

module.exports.get = get;
module.exports.getById = getById;