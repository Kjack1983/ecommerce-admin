const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandlers');

exports.categoryById = (req, res, next, id) => {
    Category.findById(id).exec((err, category) => {
        if(err || !category) {
            return res.status(400).json({
                error: 'Category does not exists'
            });
        }
        req.category = category;
        next();
    })
}

exports.create = (req, res) => {
    const category = new Category(req.body);

    // Find category By name.
    Category.find({name: req.body.name}).exec((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        
        // Check if result exists from the query execution.
        if(data.length > 0) {
            return res.status(400).json({
                error: 'Category Name provided already exists!'
            });
        } 
        
        // OtherWise save the category
        category.save((err, categoryData) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json({ categoryData });
        });
    })

}

/**
 * Update category.
 */
exports.update = (req, res) => {
    const category = req.category;
    category.name = req.body.name;

    category.save((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json(data);
    })

}

/**
 * Remove category.
 */
exports.remove = (req, res) => {
    let category = req.category;

    category.remove((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({
            message: "Category was successfully deleted"
        });
    })

}

/**
 * list categories
 */
exports.list = (req, res) => {
    Category.find().exec((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json(data);
    })
}

exports.read = (req, res) => {
    return res.json(req.category);
}











