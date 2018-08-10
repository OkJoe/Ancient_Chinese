var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bodyParser = require('body-parser');

router.use(bodyParser.text())

// Set up connection to database.
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '00000000',
	database: '中古音',
});

// Connect to database.
connection.connect();

// Fetch data from database. 
router.post('/', function(req, res, next) {

	var query = req.body; 
	
	// Query for characters. 
	if (query.type=='charQuery') {
		connection.query("SELECT * FROM 字 WHERE 字 LIKE '"+query.value+"%'", function(err, result) {
			if (err) throw err;
			res.json(result);
		});
	}
	
	//Query for words. 
    else if (query.type=='wordQuery') {
    	
    	//Check if only words starting with query.value is queried. 
		if (query.initOnly) {
			connection.query("SELECT * FROM 詞 WHERE 詞 LIKE '"+query.value+"%'", function(err, result) {
				if (err) throw err;
				res.json(result);
			});
		}
		else {
			connection.query("SELECT * FROM 詞 WHERE 詞 LIKE '%"+query.value+"%'", function(err, result) {
				if (err) throw err;
				res.json(result);
			});
		}
		
	}
	
	//Query for prononciations. 
	else if (query.type=='pronQuery') {
		connection.query("SELECT * FROM 字 WHERE (聲母 LIKE ? && 韻母 LIKE ?)", [query.cons, query.vowl], function(err, result) {
			if (err) throw err;
			res.json(result);
		});
	}

	else if (query.type=='charSubmit') {
		connection.query(query.command, function(err, result) {
			if (err) throw err;
			res.json({'text': 'Successfully submitted!'});
		});
	}

});

module.exports = router;