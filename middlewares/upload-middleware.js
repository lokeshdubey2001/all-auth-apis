const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null, path.join(__dirname, '../public/images'))
        }
    },
    filename: function(req, file, cb){
        const name= Date.now()+'-'+file.originalname;
        cb(null, name);
    }
});

const checkFileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }
    else{
        cb(null, false)
    }
}

const uploadMiddlware = multer({ 
    storage: storage,
    fileFilter: checkFileFilter
});

module.exports = uploadMiddlware;