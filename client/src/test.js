const fs = require('fs'); 

function write(str) {
	fs.writeFile('./data.json', str, 'utf8', console.log('Success! ')); 
}

export default write; 