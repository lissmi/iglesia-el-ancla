const fs = require('fs');
const path = require('path');

const excludedFolders = ['node_modules', 'imagenes', 'public', 'assets', '.git', 'build'];
const excludedExtensions = ['.jpg', '.png', '.css'];
const excludedFiles = ['package-lock.json', 'README.md', '.gitignore', '.gitattributes'];
const outputFileName = 'files_list.txt';

function scanDirectory(directory) {
    let filesContent = '';

    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !excludedFolders.includes(file)) {
            filesContent += scanDirectory(filePath);
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (!excludedExtensions.includes(ext) && !excludedFiles.includes(file)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                filesContent += `\n\nFile: ${filePath}\n\n${fileContent}\n\n`;
            }
        }
    });

    return filesContent;
}

function writeToFile(content) {
    fs.writeFileSync(outputFileName, content, 'utf8');
    console.log(`File content written to ${outputFileName}`);
}

const filesContent = scanDirectory(__dirname);
writeToFile(filesContent);
