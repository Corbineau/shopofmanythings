require('dotenv').config();
var Table = require('cli-table');
var mysql = require('mysql');
var inquirer = require('inquirer');
var config = require('./config');
// create the connection information for the sql database

var connection = mysql.createConnection({
  //everything is in the config. 
  host: "localhost",
  port: 3306,
  user: "root",
  password: config.dbPass,
  database: config.db,
  // socketPath: '/var/run/mysqld/mysqld.sock',
  connectTimeout: 30000
});

const table = new Table({
  head: ['item id', 'product name', 'product description', 'department', 'price', '# in stock']
  , colWidths: [10, 25, 25, 25, 10, 15]
});

//array so that I'm not having to constantly query unless something changes in the database.
var products = [];



//shopping cart. Went this way because it's easier to refer back to the items in the object.

var cart = {
  totalPrice: 0,
  items: [],
  itemCount: function () {
    if (this.items.length) {
      return this.items.length;
    } else {
      return 0;
    }
  },

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

  tallyItem: function (item) {
    return (item.quantity * item.price)
  },

  tallyCart: function () {
    for (let i = 0; i < this.items.length; i++) {
      this.totalPrice += (this.items[i].price * this.items[i].quantity);
    }
    console.log(this.totalPrice);
  },

  empty: function () {
    this.itemCount = 0;
    this.totalPrice = 0;
    this.items = [];

  },

  showCart: new Table({
    head: ['item', 'price', 'quantity', 'total']
    , colWidths: [25, 25, 25, 25]
  }),

  fillCart: function () {
    for (var i = 0; i < this.items.length; i++) {
      this.showCart.push(
        [this.items[i].name, this.items[i].price, this.items[i].quantity, this.tallyItem(items[i])]
      );
    };
    console.log(showCart.toString());
  }

}

//validation to make sure that the user selects a valid quantity
const inStock = (num, ans) => {
  if (isNaN(num)) {
    console.log("\n Please enter a valid quantity.");
  } else {
    connection.query("SELECT stock_quantity FROM products WHERE (?)", { product_id: ans.item }, function (err, res) {
      if (err) throw err;
      if (res < num) {
        console.log("\n I'm sorry, we don't have that many! Please enter a lower quantity.");
        //it'd be cool to also have this alert the manager to order more. 
      } else {
        return true
      }
    })
  }

}

const isItem = (input) => {
  num = parseInt(input);
  let check = products.find(product => product.item_id === num);
  if (check) {
    return true
  } else {
    console.log(`\n please enter a valid item id.`)
  }

}


// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to initialize everything.
  console.log("connected!");
  start();

});

const start = function () {
  cart.empty();
    showProd();
    store();
  }


  const showProd = () => {
    connection.query("SELECT * FROM products", function (err, res) {
      if (err) throw err;
      products = res;
      for (let i = 0; i < res.length; i++) {
        table.push(
          [res[i].item_id, res[i].product_name, res[i].product_desc, res[i].department_name, res[i].price, res[i].stock_quantity]
        );
      };
      console.log(table.toString());
    })
  }


  const store = () => {
    inquirer.prompt([
      {
        type: "input",
        message: `Select the ID of the item you'd like to purchase:`,
        name: "item",
        validate: isItem
      },
      {
        type: "input",
        message: "how many do you want?",
        name: "quantity",
        validate: inStock
      }]).catch(function (err) {
        throw err;
      }).then(function (ans) {
        //find the chosen item and get its relevant features
        let query = "SELECT product_name, price, stock_quantity FROM products WHERE item_id = ?";
        connection.query(query, { item_id: ans.item }, function (res) {
          let newItem = {
            name: res.product_name,
            price: res.price,
            quantity: ans.quantity
            //figure out where to add the functionality to change the quantity of an item in the cart and make the price changes
          }
          cart.addItem(newItem);
          console.log(cart.items);
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
        ]).then(function (ans) {
          if (ans.check) {
            store();
          } else {
            inquirer.prompt([
              {
                type: "confirm",
                message: `you have ${cart.itemCount} items in your cart: \n
              ${cart.fillCart()}/n
              For a total of ${cart.tallyCart}. \n  
              Would you like to make changes?`,
                name: "total"
              }
            ]).then(function (ans) {
              if(total){
                //update DB to remove thingies.
              }

            })

          }

        })


      })
  }
