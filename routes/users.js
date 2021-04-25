const logIn = (app, db) => {
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
                    const id = result[index].id;
    
                    let newSql = "UPDATE users SET loggedIn = 'true' WHERE id = " + id;
                    db.query(newSql, (err, newResult) => {
                        if(err) throw err;
    
                    });
    
                    response.send({id: id, loggedIn: true});
                } else {
                }
            });
        } else {
            response.end();
        }
    });
}

module.exports.logIn = logIn;