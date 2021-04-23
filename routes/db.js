function getDatabase(){

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

    return db;
}

module.exports = getDatabase;