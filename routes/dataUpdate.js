var mysql = require('mysql');
var entireData = require('../client/src/dataEmpty.json'); 
var fs = require('fs');

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
var dataToUpdate = []; 
connection.query("SELECT * FROM 字 WHERE isRegistered = FALSE", function(err, result) {
	if (err) throw err;

	for (var n of result) {
		upDate(entireData, n); 
	}
	
	//upDate(entireData, result[0]); 

	fs.writeFile('../client/src/data.json', JSON.stringify(entireData), 'utf8', console.log('Success! '));
	
}); 

connection.end(); 

function upDate(allData, n) {
	for (var OC of ['開', '合']) {
		for (var rank of ['一', '二', '三', '四']) {
			var data = allData[OC][rank]; 
			var found = false; 
			var rowId, colId, rowIdId, colIdId; 
			var dubId; 
			
			for (colId = 0; colId < data.cols.length; colId++) {
				if (trimToStem(n.韻母)==data.cols[colId][0]) {
					found = true; 
					break; 
				}
			}
			if (found) {
				for (rowId = 0; rowId < data.rows.length; rowId++) {
					var consFound = false; 
					for (rowIdId = 0; rowIdId < data.rows[rowId][1].length; rowIdId++) {
						if (n.聲母==data.rows[rowId][1][rowIdId][0]) {
							if (n.聲母=='ɣ' && data.rows[rowId][0]=='x' && rank=='三') {break}
							consFound = true; 
							break; 
						}
					}
					if (consFound) {break; }
				}
				
				var dublication = false; 
				if ((data.rows[rowId][0]=='p' || data.rows[rowId][0]=='k' || data.rows[rowId][0]=='x' || data.rows[rowId][0]=='ʔ') && (data.cols[colId][0]=='iɛ' || data.cols[colId][0]=='ie' || data.cols[colId][0]=='i' || data.cols[colId][0]=='yɛ' || data.cols[colId][0]=='ye' || data.cols[colId][0]=='yi')) {
					var dublication = true; 
					for (dubId = 0; dubId < data.cols[colId][2].length; dubId++) {
						var vowlFound = false; 
						for (colIdId = 0; colIdId < data.cols[colId][2][dubId].length; colIdId++) {
							if (trimTone(n.韻母)==data.cols[colId][2][dubId][colIdId][0]) {
								vowlFound = true; 
								break; 
							}
						}
						if (vowlFound) {break; }
					}
				}
				else {
					for (colIdId = 0; colIdId < data.cols[colId][1].length; colIdId++) {
						if (trimTone(n.韻母)==data.cols[colId][1][colIdId][0]) {
							vowlFound = true; 
							break; 
						}
					}
				}
				
				if (data.data[rowId][colId].length==0) {
					if (dublication) {
						data.data[rowId][colId] = fillArray(false, data.cols[colId][2].length+1); 
						data.data[rowId][colId][0] = '重紐'; 
						data.data[rowId][colId][dubId+1] = []; 
						for (var i=0; i<data.rows[rowId][1].length; i++) {
							data.data[rowId][colId][dubId+1].push([]); 
							for (var j of data.cols[colId][2][dubId]) {
								data.data[rowId][colId][dubId+1][i].push([]); 
							}
						}
					}
					else {
						for (var i=0; i<data.rows[rowId][1].length; i++) {
							data.data[rowId][colId].push([]); 
							for (var j of data.cols[colId][1]) {
								data.data[rowId][colId][i].push([]); 
							}
						}
					}
				}
				if (dublication && !data.data[rowId][colId][dubId+1]) {
					data.data[rowId][colId][dubId+1] = []; 
					for (var i=0; i<data.rows[rowId][1].length; i++) {
						data.data[rowId][colId][dubId+1].push([]); 
						for (var j of data.cols[colId][2][dubId]) {
							data.data[rowId][colId][dubId+1][i].push([]); 
						}
					}
				}
				
				
				if (dublication) {
					if (data.data[rowId][colId][dubId+1][rowIdId][colIdId].length==0) {
						if (data.cols[colId][2][dubId][colIdId][0].search(/m|n|ŋ/)>-1) {
							data.data[rowId][colId][dubId+1][rowIdId][colIdId] = [false, false, false, false]; 
						}
						else {data.data[rowId][colId][dubId+1][rowIdId][colIdId] = [false, false, false]; }
					} 
					editTabData(n.韻母, data.data[rowId][colId][dubId+1][rowIdId][colIdId]); 
				}
				else {
					if (data.data[rowId][colId][rowIdId][colIdId].length==0) {
						data.data[rowId][colId][rowIdId][colIdId].push(false, false, false); 
						if (data.cols[colId][1][colIdId][0].search(/m|n|ŋ/)>-1) {
							data.data[rowId][colId][rowIdId][colIdId].push(false); 
						}
					} 
					editTabData(n.韻母, data.data[rowId][colId][rowIdId][colIdId]); 
				}
				return;
			}
		}
	}
}

function trimToStem(vowl) { 
	const vowl1 = (vowl.lastIndexOf('i')>0 ? vowl.substring(0, vowl.length-1) : vowl); 
	const vowl2 = (vowl1.lastIndexOf('u')>0 ? vowl1.substring(0, vowl1.length-1) : vowl1); 
	return vowl2.split(/m|p|n|t|ŋ|k/)[0].replace(/́|̀/, '').replace(/ɪ/, 'i').replace(/ʏ/, 'y').replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/, 'o').replace(/[úù]/, 'u'); 
}

function trimTone(vowl) {
	return vowl.replace(/́|̀/, '').replace(/p/, 'm').replace(/t/, 'n').replace(/k/, 'ŋ').replace(/ɪ/, 'i').replace(/ʏ/, 'y').replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i').replace(/[óò]/, 'o').replace(/[úù]/, 'u'); 
}

function fillArray(value, len) {
  var arr = new Array(len);
  for (var i = 0; i < len; i++) {
    arr[i] = value;
  }
  return arr;
}

function editTabData(vowl, arr) {
	if (vowl.search(/p|t|k/)>-1) {
		arr[3] = vowl; 
	} 
	else if (vowl.search(/[́áéíóú]/g)>-1) {
		arr[1] = vowl; 
	}
	else if (vowl.search(/[̀àèìòù]/g)>-1) {
		arr[2] = vowl; 
	}
	else {
		arr[0] = vowl; 
	}
}