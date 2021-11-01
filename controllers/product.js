const Product = require('../models/productModel');
const User = require('../models/userModel');

module.exports.GetAllProducts = async (req, res)=> {
    const pageSize = 9;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword 
    ?   {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            },
        } 
    :   {}

    const count = await Product.countDocuments({ ... keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1));
    res.json({products, page, pages: Math.ceil(count/pageSize) });
};


module.exports.AddProduct = async (req, res)=> {
    const {name, price, description, image, brand, category, countInStock, user} = req.body;

    const product = new Product({
        name : name, 
        price : price,
        description : description,
        brand : brand,
        category : category,
        countInStock : countInStock,
        image : image,
        user : user
    });

    const createdProduct = await product.save()
    res.status(201).json(createdProduct);
};

module.exports.CreateProductReview = async (req, res)=> {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    const reqUser = await User.findOne({ username: req.query.username });

    console.log(reqUser, req.query.username);

    if(product) {
        const alreadyReviewed = product.reviews.find(r =>  r.user.toString() === reqUser._id.toString() ); // check if use has submitted review
        
        if(alreadyReviewed) {
            res.status(400).json('Product already reviewed by this user')
        } 
        else 
        {
        const review = {
            name: reqUser.username,
            rating: Number(rating),
            comment,
            user: reqUser._id
        }

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item)=> item.rating + acc, 0) / product.reviews.length ;

        await product.save();

        res.status(201).json({ message: 'Review added'});
        }   
    }   
};

module.exports.DeleteProduct = async (req, res)=> {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.remove();
        res.status(204).json({ message: 'Product deleted'});
    } else {
        res.status(404).json({ message: 'Product not found'});
    }
};

module.exports.GetProductByID = async (req, res)=> {
    const product = await Product.findById(req.params.id)
        if(product){
           res.status(201).json(product); 
        } else {
            res.status(404).json({ message: 'Product not found'})
        }; 
};

module.exports.UpdateProduct = async (req, res)=> {
    const {name, price, description, image, brand, category, countInStock} = req.body;

    const product = await Product.findById(req.params.id);

    if(product) {
        product.name = name // assign product new value destructured from req.body
        product.price = price
        product.description = description
        product.image = image
        product.brand = brand
        product.category = category
        product.countInStock = countInStock

        const updatedProduct = await product.save()
        res.status(201).json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found'});
    }
};