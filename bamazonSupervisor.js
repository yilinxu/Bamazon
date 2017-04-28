var config = require("./config.js");
var inquirer = require("inquirer");
var mysql = require("mysql");
require("console.table");
var dbConnection = mysql.createConnection(config);
var department_name=[];

dbConnection.connect(function(err){
	if (err) throw err;
	select_option();
});

function select_option(){
	inquirer.prompt({
		name: "action",
		type: "rawlist",
		message: "select options list below",
		choices: ["View Product Sales by Department","Create New Department"]
	}).then(function(result){
			switch (result.action){
			case "View Product Sales by Department":
			showdata();
			break;

			case "Create New Department":
			createDepartment();
			break;
		}
	})
};

function showdata(action){
	dbConnection.query('select department_name from departments',function(err, result){
		if(err) throw err;
		var result = JSON.parse(JSON.stringify(result));
		for (var i =0; i < result.length; i++){
			department_name.push(result[i]["department_name"]);
		};
	});
	dbConnection.query("select department_name, sum(product_sales) as total_sales from product group by department_name", function(err, result){
		if (err) throw err;
		var result = JSON.parse(JSON.stringify(result));
		for(var i=0; i<result.length; i++){
			if (department_name.indexOf(result[i].department_name)!==-1){
				var profit = result[i].total_sales;
				var department=result[i].department_name;
				dbConnection.query("update departments set product_sales=? where department_name=?",[profit,department], function(err){
				if (err) throw err;
				});
				dbConnection.query("update departments As d set d.total_profit= d.product_sales-d.over_head_costs",function(err){
					if(err) throw err;
				})
			}
		};

		dbConnection.query("select * from departments", function(err, result){
			if (err) throw err;
			console.table(result);
			if(select_option){
			select_option();
		};
		});

	});
};

function createDepartment(){
	inquirer.prompt([
	{
		name: "department_id",
		type: "input",
		message: "what is the department_id?",
	},
	{
		name: "department_name",
		type:"input",
		message: "what is the product name?"
	},
	{
		name: "over_head_costs",
		type: "input",
		message: "what is the over_head_costs for the department?",
	}]).then(function(result){
		checkValidate(result);
})
};

function checkValidate(value){
	dbConnection.query("select department_id from departments", function(err, result){
				if (err) throw err;
				var result = JSON.parse(JSON.stringify(result));
				var id = [];
				var name=[];
				for (key in result){
					id.push(result[key]["department_id"]);
				};
				if (id.indexOf(parseInt(value["department_id"]))===-1){
					dbConnection.query("insert into departments (department_id,department_name,over_head_costs) values (?,?,?);",[value["department_id"],value["department_name"],value["over_head_costs"]],function(err){
						if(err) throw err;
					});
					select_option();
					}else{
						console.log("wrong information!")
						select_option();
					}		
			})
};

