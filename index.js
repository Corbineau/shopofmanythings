var mysql = require('mysql');
var inquirer = require('inquirer');

inquirer.prompt({
    type: "list",
    message: "what would you like to buy?",
    choices: [],
    name: "options"
})