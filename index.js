var mysql = require('mysql');
var inquirer = require('inquirer');
// create the connection information for the sql database
var connection = mysql.createConnection({
    //everything is in the config. 
    host: config.dbHost,
    port: config.port,
    user: config.dbUser,
    password: config.dbUser,
    database: config.db
  });
  
  // connect to the mysql server and sql database
  connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

  var start = function() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
    inquirer.prompt({
        type: "rawlist",
        message: "what would you like to buy?",
        choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
        name: "options"
    })

  }
