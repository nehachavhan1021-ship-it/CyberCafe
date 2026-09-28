const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "..", "uploads");

const deleteFile = (fileName) => {
    if (!fileName) {
        return;
    }

    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);

        console.log(`Deleted file: ${fileName}`);
    }
};

module.exports = {
    deleteFile
};