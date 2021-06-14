const { MongoClient } = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var config = require('../config/mongodb.config');
const uri = config.mongodb;

let getDetail = async(productId)=>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("product").findOne({'_id': ObjectID(productId)})
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
} 
let getByCategory = async(categoryId,skip = 0, limit = 30)=>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("product").find({"breadcrumbs._id" : { $in : [ObjectID(categoryId)]}}).skip(skip).limit(limit).toArray()
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let getCategoryLevel1 = async() =>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("category").find({'level':1}).toArray()
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let getCategory = async(categoryId) => {
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("category").findOne({'_id':ObjectID(categoryId)})
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let getNoiBat = async(skip = 0,limit = 30)=>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("product").find({}).skip(skip).limit(limit).toArray()
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let postCategory = async(name,parent=null)=>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const loadcheck = await client.db("qtcsdlhd").collection("category").findOne({'name':name});
        if(loadcheck){
            await client.close();
            return {"insertedId":loadcheck['_id']};
        }
        if(parent){
            var an = await client.db("qtcsdlhd").collection("category").findOne({'_id':ObjectID(parent)});
            var level = an['level'] + 1;
        }
        else{
            var level = 1;
        }
        var document = {
            'name': name ,
            'level': level,
            'ancestors':[]
        }
        if(level > 1){
            if(an.ancestors.length){
                an.ancestors.forEach(element => {
                    delete element['ancestors'];
                    document.ancestors.push(element); 
                });
            }
            delete an['ancestors'];
            document.ancestors.push(an);
        }        
        const result = await client.db("qtcsdlhd").collection("category").insertOne(document);
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let postProduct = async(userId,shopId,categoryId,name,option_attributes,price) => {
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const auth = await client.db("qtcsdlhd").collection("Shop").findOne({
            '_id':ObjectID(shopId),'userId':ObjectID(userId)},
            { projection: { shopName: 1 } })
        if(!auth){
            throw "err";
        }
        const category = await client.db("qtcsdlhd").collection("category").findOne({'_id':ObjectID(categoryId)})
        var breadcrumbs = []
        category.ancestors.forEach(element => {
            breadcrumbs.push(element); 
        });
        delete category['ancestors'];
        breadcrumbs.push(category);
        breadcrumbs.push({'name' : name});
        // var op_atr = [];
        
        // option_attributes.forEach(element => {
        //     op_atr.push(JSON.parse(element));
        // });
        var document = {
            "name": name,
            "description": "description",//data.description,
            "price": price,
            "image": "https://images-na.ssl-images-amazon.com/images/I/715uwlmCWsL.jpg",
            "images": [
                "https://images-na.ssl-images-amazon.com/images/I/6110JInm%2BBL.jpg",
                "https://images-na.ssl-images-amazon.com/images/I/41FuQMh3FUL.jpg"
            ],
            "option_attributes": option_attributes,//JSON.parse(option_attributes),
            "breadcrumbs": breadcrumbs,
            "shop": auth, 
        }
        const result = await client.db("qtcsdlhd").collection("product").insertOne(document)
        const res = await client.db("qtcsdlhd").collection("Shop").updateOne({
            '_id':ObjectID(shopId),'userId':ObjectID(userId)
        },
        {
            '$push': {"products":{'_id':result.ops[0]._id,'name':result.ops[0].name,"breadcrumbs": result.ops[0].breadcrumbs}}
        })
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let postReview = async(userId,objectId,star) => {
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const flag = await client.db("qtcsdlhd").collection("review").findOne({
            'object':ObjectID(objectId),
            "reviews.user" : { $in : [ObjectID(userId)]}         
        }) 
        if(flag){
            await client.close();
            throw err;
        }
        const rev = {
            "user": ObjectID(data.userId),
            "content": "sp dowr teej",
            "star": 1 * star
        };
        const result = await client.db("qtcsdlhd").collection("review").updateOne({
            'object':ObjectID(objectId),         
        },{
            "$push":{"reviews":rev},
            "$inc": {"rateValue": 1,"rateCount": rev.star}
        },
        { upsert: true }
        );
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
let findcategorybyname = async(name)=>{
    try{
        const client = new MongoClient(uri, { useUnifiedTopology: true } );
        await client.connect({native_parser:true});
        const result = await client.db("qtcsdlhd").collection("category").findOne({'name':name})
        await client.close();
        return result;
    } catch(err){
        throw err;
    }
}
module.exports = {
    getDetail:getDetail,
    getByCategory:getByCategory,
    getCategory:getCategory,
    postCategory:postCategory,
    postProduct:postProduct,
    postReview:postReview,
    getCategoryLevel1:getCategoryLevel1,
    getNoiBat:getNoiBat,
    findcategorybyname:findcategorybyname
}