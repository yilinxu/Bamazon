var config = require("./config.js");
var inquirer = require("inquirer");
var mysql = require("mysql");
require("console.table");
var dbConnection = mysql.createConnection(config);
var item_id = 0;
var quality = 0;
var stock_quality = 0;
var sales = 0;
var column_name = [];

dbConnection.connect(function(err){
	if (err) throw err;
	display_item(select_item);
});

function display_item(action){
	dbConnection.query("select item_id, product_name, price from product", function(err, result){
		if (err) throw err;
		console.table(result);
		if(select_item){
			select_item();
		}
	})
};

function select_item(action){
	inquirer.prompt([
	{
		name: "item",
		type: "input",
		message: "which item_id do you want to purchase?",
		validate: function(value){
			if (parseInt(value) <20){
				return true;
			}
			return false;
		}
	},
	{
		name: "quality",
		type: "input",
		message: "how many do you want to purchase?",
		validate:function(value){
			if(isNaN(value)===false){
				return true;
			}
			return false;
		}
	}]).then(function(result){
		item_id = parseInt(result.item);
		quality = parseInt(result.quality);
		if (check_quality){
			check_quality();
			}
	});	
};

function check_quality(action){
	dbConnection.query("select stock_quality from product where item_id = ?", item_id, function(err, result){
		var quality_value = JSON.parse(JSON.stringify(result))[0]["stock_quality"];
		if (quality > quality_value){
			console.log("Insufficient quality!");
			dbConnection.end();
		}else{
			stock_quality = quality_value - quality;
			dbConnection.query("update product set stock_quality=? where item_id=?",[stock_quality, item_id], function(err){
				if(err) throw err;
			});
			dbConnection.query("select price from product where item_id=?",[item_id], function(err, result){
				if (err) throw err;
				var price = JSON.parse(JSON.stringify(result))[0]["price"];
				sales = price*quality;
				console.log("Your total cost is: " + sales);
				if(update_sales){
				update_sales();
				};
			});
		};
	})
};


function update_sales(){
	dbConnection.query('show columns from product',function(err, result){
		if(err) throw err;
		// JSON.parse(JSON.stringify(result))[0]["stock_quality"];
		var result = JSON.parse(JSON.stringify(result));
		for (var i =0; i < result.length; i++){
			column_name.push(result[i]["Field"]);
		}
		if(column_name.indexOf("product_sales")===-1){
			dbConnection.query("alter table product add product_sales decimal(11,4) default 0", function(err){
				if(err) throw err;
			});
		}
	});

	dbConnection.query("update product set product_sales=product_sales+? where item_id=?",[sales,item_id], function(err, result){
				if(err) throw err;
				dbConnection.end();
			});
};
