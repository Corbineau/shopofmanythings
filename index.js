import Table from 'cli-table';
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

const table = new Table({
  head: ['item id', 'product name', 'product description', 'department', 'price', 'no. in stock' ]
, colWidths: [50, 100, 300, 100, 50, 50]
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

//shopping cart? I don't know if I have the wherewithal, but perhaps something like...

var cart = {
  totalPrice: 0,
  items: [],
  itemCount: this.items.length,

  addItem: function (item) {
    this.items.push(item);
    this.tallyCart();
  },

  removeItem: function (item) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] === item) {
        this.items.splice(i, 1);
      }
    }
    this.tallyCart();
  },

  tallyCart: function() {
    for (let i = 0; i < this.items.length; i++) {
      this.totalPrice += (this.items[i].price * this.items[i].quantity);
    }
    console.log(this.totalPrice);
  },

  empty: function () {
    this.itemCount = 0;
    this.totalPrice = 0;

  }

}

//validation to make sure that the user selects a valid quantity
const inStock = (num, ans) => {
  if (typeof num != Number) {
    console.log("Please enter a valid quantity.");
  } else {
    connection.query("SELECT quantity FROM products WHERE ?", { product_id: ans.item }, function (err, res) {
      if (res < num) {
        console.log("I'm sorry, we don't have that many! Please enter a lower quantity.");
        //it'd be cool to also have this alert the manager to order more. 
      } else {
        return true
      }
    })
  }

}


const start = function () {
  cart.empty();
  viewAll();
  store();
}


const viewAll = () => {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // build a pretty table
    for (var i = 0; i < res.length; i++) {
      table.push(
          [res[i].item_id, res[i].product_name, res[i].product_desc, res[i].department_name, res[i].price, res[i].stock_quantity]
      );
    };
    console.log(table.toString());
    }
  )}


const store = () => {
    inquirer.prompt({
      type: "rawlist",
      message: "Select the ID of the item you'd like to purchase",
      choices: function () {
        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
          choiceArray.push(results[i].item_id);
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
      }).then(function (ans) {
        //find the chosen item and get its relevant features
        let query = "SELECT product_name, price, stock_quantity FROM products WHERE ?";
        connection.query(query, { product_id: ans.item }, function (res) {
          let newItem = {
            name: res.product_name,
            price: res.price,
            quantity: ans.quantity
            //figure out where to add the functionality to change the quantity of an item in the cart and make the price changes
          }
          cart.addItem(newItem);
          return newItem
        })
      }).catch(function (err) {
        throw err;
      }).then(function (res) {
        //ask if they want more stuff
        inquirer.prompt([
          {
            type: "confirm",
            message: "would you like to add anything else?",
            name: "check"
          }
        ]).then(function(ans){
          if(ans.check){
            store();
          } else {
            inquirer.prompt([
              {
                type: "confirm",
                message: `you have the following items in your cart:
                
                `,
                name: "total"
              }
          
            ])

      }

      )

  })

}
