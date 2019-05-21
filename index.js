var mysql = require('mysql');
var inquirer = require('inquirer');
// create the connection information for the sql database
var connection = mysql.createConnection({
    //everything is in the config. 
    host: config.dbHost,
    port: config.port,
    user: config.dbUser,
    password: config.pass,
    database: config.db
  });
  
  // connect to the mysql server and sql database
  connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });

  //shopping cart? I don't know if I have the wherewithal, but perhaps something like...

  var cart = {
    itemCount: 0,
    totalPrice: 0,
    items: [],

    addItem: function(item) {
      totalPrice += (item.price * item.quantity);
      this.items.push(item);
    },

    removeItem: function(item) {
      for(let i = 0; i < this.items.length; i++) {
        if(this.items[i] === item){
          this.items.splice(i, 1);
        }
      }

    }

  }

  //validation to make sure that the user selects a valid quantity
  const inStock = (num, ans) => {
    if(typeof num != Number) {
      console.log("Please enter a valid quantity.");
    } else {
      connection.query("SELECT quantity FROM products WHERE ?", {product_id: ans.item}, function(err, res) {
        if(res < num) {
          console.log("I'm sorry, we don't have that many! Please enter a lower quantity.");
          //it'd be cool to also have this alert the manager to order more. 
        } else {
          return true
        }
      })
    }

    }


  var start = function() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
     var cart;   
    inquirer.prompt({
        type: "rawlist",
        message: "Select the ID of the item you'd like to purchase",
        choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
        name: "item"
    },
    {
      type: "input",
      message: "how many do you want?",
      name: "quantity",
      validate: inStock
    }).then(function(ans){
      //find the chosen item and get its relevant features
      let query = "SELECT product_name, price, quantity FROM products WHERE ?";
      connection.query(query, {product_id : ans.item}, function(err, res) {
        let newItem = {
          name: res.product_name,
          price: res.price,
          quantity: ans.quantity
        }
      })
    }).catch(function(err){
      throw err;
    }).then(function(res) {
      //confirm the purchase
      let total = (res.price * quant);

      inquirer.prompt([
          {
            type: "confirm",
            message: `you have selected ${item} X ${quant}, for a total price of ${total}. Is this correct?`,
            name: "finalSale"
          }
        ]) 

    }
      
    )

    })}
