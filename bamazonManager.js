var config = require("./config.js");
var inquirer = require("inquirer");
var mysql = require("mysql");
require("console.table");

var item_id = 0;
var quality = 0;

var dbConnection = mysql.createConnection(config);
dbConnection.connect(function(err){
	if(err) throw err;
	list_option();
});

function list_option(){
	inquirer.prompt({
		name: "option",
		type: "rawlist",
		message: "select options list below",
		choices: ["View Products for Sale","View Low Inventory","Add to Inventory", "Add New Product","exit"]
	}).then(function(result){
		switch (result.option){
			case "View Products for Sale":
			view_product();
			break;

			case "View Low Inventory":
			view_lowInventory();
			break;

			case "Add to Inventory":
			add_inventory();
			break;

			case "Add New Product":
			add_new_product();
			break;

			case "exit":
			select_done();
			break;
		}
	})
};

function view_product(){
	dbConnection.query("select item_id, product_name, price, stock_quality from product", function(err, result){
		if(err) throw err;
		console.table(result);
		list_option();
	})
};

function view_lowInventory(){
	dbConnection.query("select item_id, product_name, price, stock_quality from product Where stock_quality < 5", function(err, result){
		if(err) throw err;
		console.table(result);
		list_option();
	})
};

function add_inventory(){
	inquirer.prompt([
	{
		name: "item",
		type: "input",
		message: "which item_id do you want to add",
		validate: function(value){
			if (parseInt(value) <12){
				return true;
			}
			return false;
		}
	},
	{
		name: "quality",
		type: "input",
		message: "how many do you want to add?",
		validate:function(value){
			if(isNaN(value)===false && parseInt(value)>0){
				return true;
			}return false;
		}
	}]).then(function(result){
		item_id = parseInt(result.item);
		quality = parseInt(result.quality);
		dbConnection.query("update product set stock_quality=stock_quality+? where item_id=?",[quality, item_id], function(err){
				if(err) throw err;
			});
		list_option();
	})
};

function add_new_product(){
	inquirer.prompt([
	{
		name: "item_id",
		type: "input",
		message: "what is the item_id?",
		validate: function(value){
			if (parseInt(value) >10){
				return true;
			}
			return false;
		}
	},
	{
		name: "product_name",
		type:"input",
		message: "what is the product name?"
	},
	{
		name: "department_name",
		type: "input",
		message: "what department does this item belong to?",
	},
	{
		name: "price",
		type: "input",
		message: "what is the price for this item",
	},
	{
		name: "stock_quality",
		type: "input",
		message: "how many do you have",
	}]).then(function(result){
		dbConnection.query("insert into product (item_id, product_name, department_name, price, stock_quality) values (?,?,?,?,?);",[result["item_id"], result["product_name"], result["department_name"], result.price, result["stock_quality"]],function(err){
			if(err) throw err;
		});
		list_option();
		})

};

function select_done(){
	dbConnection.end();
};



