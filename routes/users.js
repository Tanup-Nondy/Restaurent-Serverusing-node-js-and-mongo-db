var express = require('express');
var bodyParser=require('body-parser');
var User=require('../models/users');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',(req,res,next)=>{
	User.findOne({username:req.body.username})
	.then((user)=>{
		if(user !=null){
			var err=new Error('User  '+req.body.username+' already exists!');
			err.status=403;
			next(err);
		}
		else{
			return User.create({
				username:req.body.username,
				password:req.body.password
			});
		}
	})
	.then((user)=>{
		res.statusCode=200;
		res.setHeader=('Content-Type','text/plain');
		res.end('registraton Successful');
	},(err)=>next(err))
	.catch((err)=>next(err));
});

router.post('/login',(req,res,next)=>{
	if(!req.session.user){
		var authHeader=req.headers.authorization;
		if(!authHeader){
			var err = new Error('You are not authenticated');
			res.setHeader('WWW-Authenticate','Basic');
			err.status=401;
			return next(err);
		}
		var auth =new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
		var username=auth[0];
		var pass=auth[1];
		User.findOne({username:username})
		.then((user)=>{
			if(user===null){
				var err = new Error('User: '+username+' not found!');
				err.status=403;
				return next(err);
			}
			else if(user.password !=pass){
				var err = new Error('Password does not match');
				err.status=403;
				return next(err);
			}
			else if(user.username==username && user.password==pass){
				req.session.user='authenticated';
				res.statusCode=200;
				res.end('Successfully logged in');
			}
		})
		.catch((err)=>next(err));
	}
	else{
		res.statusCode=200;
		res.setHeader=('Content-Type','text/plain');
		res.end('You are already logged in');
	}
});

router.get('/logout',(req,res)=>{
	if(req.session){
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	}
	else{
		var err = new Error('Password does not match');
		err.status=403;
		return next(err);
	}
});

module.exports = router;
