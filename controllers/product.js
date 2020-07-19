const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/product');
const fs =  require('fs');
const { errorHandler } = require('../helpers/dbErrorHandlers');

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product) {
            return res.status(400).json({
                error: 'Product not found'
            });
        }
        req.product = product;
        next();
    })
}

exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    console.log('form :>> ', form);

    form.keepExtentions = true;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        let product = new Product(fields);

        const  {name, description, price, category, shipping, quantity} = fields;

        if (!name || !description || !price || !category || !shipping || !shipping || !quantity) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        if(files.photo) {
            
            // if file size is bigger than 1000000
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1Mb please try again'
                })
            }

            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result);
        });
    })   
}


exports.remove = (req, res) => {
    let product = req.product;

    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            message: "The product was deleted successfully"
        })

    });
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();

    form.keepExtentions = true;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }

        let product = req.product;
        product = _.extend(product, fields);

        const  {name, description, price, category, shipping, quantity} = fields;

        if (!name || !description || !price || !category || !shipping || !shipping || !quantity) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        if(files.photo) {
            
            // if file size is bigger than 1000000
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1Mb please try again'
                })
            }

            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result);
        });
    });
}

/**
 * sell / arrival
 * !by sell = /products?sortBy=sold&order=desc&limit=4
 * !by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned.
 */
exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let shortBy = req.query.shortBy ? req.query.shortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
        .select('-photo') // deselect photo field because of the size and it will be slow.
        .populate('category')
        .sort([[shortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if(err) {
                return res.status(400).json({
                    error: 'Products not found'
                })
            }

            res.json(products);
        })
}

/**
 * It will find the products based on the req product category
 * other products that have the same category will be returned.
 */
exports.listRelated = (req, res) => {
    // Set limit parameter ?limit=1
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    /**
     * all the related product but not the current one $ne stands for (not included).
     * However we want to find the products based on category (req.product.category) 
     * that matches the req.product.category and it does not include 
     * the product itself.
     * !how to deselect .select('-photo')
     */  
    Product.find({_id: {$ne: req.product}, category: req.product.category})
    .limit(limit)
    .populate('category', '_id name') // populate certain fields.
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: 'Products not found'
            })
        }

        res.json(products);
    })
}


exports.listCategories = (req, res) => {
    // Find all the categories that are used for that specific product (distinct)
    // {} empty object however you can pass queries in there.
    Product.distinct("category", {}, (err, categories) => {
        if(err) {
            return res.status(400).json({
                error: 'categories not found'
            })
        }
        res.json(categories);
    })
}

/**
 * list products by id
 * we will implement product search  in react frontend
 * we will show categories in checkbox and price range  in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make API request  and display the products to users based on what the want.
 */
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if(err) {
                return res.status(400).json({
                    error: 'Products not found'
                })
            }
            res.json({
                size: data.length,
                data
            });
        });
}

exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}