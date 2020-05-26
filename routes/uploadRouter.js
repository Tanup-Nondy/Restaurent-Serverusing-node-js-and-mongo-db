const express = require('express');
const bodyParser = require('body-parser');
var authenticate=require('../authenticate');
var multer=require('multer');


const storage=multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'public/images');
	},
	filename:(req,file,cb)=>{
		cb(null,file.originalname);
	}
});
const imageFileFilter=(req,file,cb) =>{
	if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
		return cb(new Error('This isnot a image file'),false);
	}
	cb(null,true);;
};
const upload=multer({storage:storage,fileFilter:imageFileFilter});
var uploadRouter = express.Router();
var jsonParser = bodyParser.json();
uploadRouter.use(jsonParser);

uploadRouter.route('/')
.get(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
        res.statusCode=403;
        res.end('Get operation not supported on /imageUpload');
})
.post(authenticate.verifyUser,authenticate.verifyAdmin,
	upload.single('imageForm'),(req, res) => {
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('Delete operation not supported on /imageUpload');
});

module.exports=uploadRouter;