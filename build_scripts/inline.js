const fs = require("fs");
const path = require("path");


let [filename, target, replacement_filename] = process.argv.slice(2);

filename = path.join(process.cwd(), filename);
replacement_filename = path.join(process.cwd(), replacement_filename);


let file = fs.readFileSync(filename, { encoding: 'utf8' });
let replacement = fs.readFileSync(replacement_filename, { encoding: 'utf8' });

file = file.replace(target, replacement);

fs.writeFileSync(filename, file, { encoding: 'utf8' });