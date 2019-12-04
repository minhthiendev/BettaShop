var multer = require('multer');
var upload = multer({ dest: 'public/images/products/' })
module.exports.upload_img = upload.single('image');