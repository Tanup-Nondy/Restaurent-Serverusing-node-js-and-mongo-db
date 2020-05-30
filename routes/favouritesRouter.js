const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const cors=require('./cors');
const Favourites=require('../models/favourites');
var authenticate=require('../authenticate');


var favouritesRouter = express.Router();
var jsonParser = bodyParser.json();
favouritesRouter.use(jsonParser);

favouritesRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({user:req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favourites)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favourites);

    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({'user':req.user._id})
    .then((favourite)=>{
        if(!favourite){
            Favourites.create({user:req.user._id})
            .then((favourites)=>{
                for(var i in req.body){
                    favourites.dishes.push(req.body[i]._id);
                }
                
                favourites.save()
                .then((favourite)=>{
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourite)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favourite);
                    },(err)=>next(err));;
                    
                },(err)=>next(err));
            },(err)=>next(err));
        }else{
            for(var i in req.body){
                var dish=req.body[i]._id;
                if(favourite.dishes.indexOf(dish)==-1){
                    favourite.dishes.push(dish);
                }
            }    
            favourite.save()
            .then((favourite)=>{
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourite)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favourite);
                },(err)=>next(err));;
                    
            },(err)=>next(err));
        }
    })
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.remove({user:req.user._id})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);

    },(err)=>next(err))
    .catch((err)=>next(err));
});

favouritesRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({user:req.user._id})
    .then((favourites)=>{
        if(!favourites){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            return res.json({"exists":false,"favourites":favourites});
        }else{
            if(favourites.dishes.indexOf(req.params.dishId)<0){
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":false,"favourites":favourites});
            }else{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":true,"favourites":favourites});
            }
        }

    },(err)=>next(err))
    .catch((err)=>next(err));
    
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.findOne({user:req.user._id})
    .then((favourite)=>{
        if(!favourite){
            Favourites.create(req.body)
            .then((favourite)=>{
                console.log("Favourites created!");
                favourite.user=req.user._id;
                favourite.dishes.push(req.params.dishId);
                favourite.save()
                .then((favourite)=>{
                    Favourites.findById(favourite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favourite)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favourite);
                    },(err)=>next(err));;
                    
                },(err)=>next(err));
            },(err)=>next(err));
        }else{
            var dish=req.params.dishId;
            if(favourite.dishes.indexOf(dish)==-1){
                favourite.dishes.push(dish);
            }
            favourite.save()
            .then((favourite)=>{
                Favourites.findById(favourite._id)
                .populate('user')
                .populate('dishes')
                .then((favourite)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favourite);
                },(err)=>next(err));;
                    
            },(err)=>next(err));
        }
    })
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Favourites.findOne({user:req.user._id})
    .then((favourite)=>{
        if(!favourite){
            err=new Error('No such dish in your favourites!');
            err.status=404;
            return next(err);
        }else{
            var dish=req.params.dishId;
            if(favourite.dishes.indexOf(dish)==-1){
                err=new Error('No such dish in your favourites!');
                err.status=404;
                return next(err);
            }
            else{
                favourite.dishes.remove(dish);
                favourite.save()
                .then((favourite)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favourite);
                },(err)=>next(err));
            }
            
        }
    })
    .catch((err)=>next(err));
});



module.exports = favouritesRouter;