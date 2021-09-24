//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const request = require("request");
const ejs = require("ejs");
const _= require("lodash");
const { json } = require("body-parser");

const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-hrutu:Fire@1234@cluster0.vwlmw.mongodb.net/usersdb',  {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

var productnum = 0;
var usersnum = 0;
var rows=[]
// Mongo Db Schema
const userSchema = {
    firstName : String,
    lastName : String,
    email : String,
    username: String,
    password: String
  };

  const productSchema = {
    name : String,
    description : String,
    catergory : String,
    stock: Number,
    price: Number,
    image : String 
  }

  const orderSchema = {
      product : String,
      quantity: Number,
      price: Number,
      user : String ,
      image : String

  }


//creating collections  
const User = mongoose.model("User",userSchema);

const Product = mongoose.model("Product",productSchema);
 
const Order = mongoose.model("Order",orderSchema);
// creating Product objests
const product1 = new Product({
    name : "Trimmer",
    description : "Philips",
    catergory : "Grooming",
    stock: 10,
    price: 700,
    image : "trimmer.png"
})

const product2 = new Product({
    name : "Battery",
    description : "Duracell",
    catergory : "Electronics",
    stock: 112,
    price: 30,
    image : "Battery.png"
})

const product3 = new Product({
    name : "Chair",
    description : "Nikamal",
    catergory : "Furniture",
    stock: 15,
    price: 400,
    image : "chair.webp"
})

// creating User objects
const admin = new User({
    username: "admin",
    password : "password",
    firstName : "Loka",
    lastName : "Anirudh",
    email : "loka@gmail.com"

});

const user1 = new User({
    username: "Sid",
    password : "sid123",
    firstName : "Sid",
    lastName : "Yadav",
    email : "sid@gmail.com"
});

const user2 = new User({
    username: "chetan007",
    password : "password",
    firstName : "Sah",
    lastName : "Chetan",
    email : "chetan2021@gmail.com"
});

// Arrays
const defaultusers=[admin,user1,user2];
const defaultproducts = [product1,product2,product3];

// Initializing Database User
User.find({}, function(err, foundItems){
     usersnum = foundItems.length;
    if (foundItems.length === 0) {
    User.insertMany(defaultusers,function(err){
        if(!err){
            console.log("Yes");
        }
    })
}})

// Initializing Database Product with default params
Product.find({}, function(err, foundItems){
     productnum = foundItems.length;
    if (foundItems.length === 0) {
    Product.insertMany(defaultproducts,function(err){
        if(!err){
            console.log("Yes");
        }
    })
}})



//Login Page

app.get("/",function(req,res){
    res.render("Loginpage");    
});

app.get("/Failure",function(req,res){
    res.render("Failure")
})

app.post("/",function(req,res){
    
    const user = req.body.username;
    const pass = req.body.password;
    User.findOne({username:user},function(err,data){
       
        if(!err)
        {
            if(data.password===pass){

                                
                 User.find({}, function(err, foundItems){
        usersnum = foundItems.length;
    });
    Product.find({}, function(err, foundItems){
        productnum = foundItems.length;
    });

    res.render("index",{numbrofusers:usersnum,numberofprod:productnum});
            }
            else{
                res.render("Failure")
            }
        
        }
        if(err){
            console.log()
        }
        
        
    })
    
    
})


// Home Page

app.get("/home",function(req,res){
    User.find({}, function(err, foundItems){
        usersnum = foundItems.length;
    });
    Product.find({}, function(err, foundItems){
        productnum = foundItems.length;
    });

    res.render("index",{numbrofusers:usersnum,numberofprod:productnum});
    res.redirect("/home")
});

app.post("/home",function(req,res){

});


// User Page
app.get("/viewU",function(req,res){

    User.find({},function(err,data){
  
        res.render("viewUsers",{userdetails:data});       
    })
});

app.get("/manageU",function(req,res){

    User.find({},function(err,data){
        res.render("manageUsers",{userdetails:data});       
    })
})

app.post("/manageU",function(req,res){

    const fname = req.body.fname;
    const lname = req.body.lname;
    const uname = req.body.uname;
    const email = req.body.email;
    const pass = req.body.pass;

    const newUser = new User({
    username: uname,
    password : pass,
    firstName : fname,
    lastName : lname,
    email : email
    })

    newUser.save();
    res.redirect("/manageU")

})


// Product Page
app.get("/viewP",function(req,res){

    Product.find({},function(err,data){
        res.render("viewProducts",{productdetails:data});       
    }
    )})

app.get("/manageP",function(req,res){
    Product.find({},function(err,data){
        res.render("manageProducts",{productdetails:data});       
    }
    
)
})

app.post("/manageP",function(req,res){

    const img = req.body.filename;
    const name = req.body.name;
    const description = req.body.des;
    const catergory = req.body.cat
    const stock = req.body.stock;
    const price = req.body.price;

    const newProduct = new Product({
        name : name,
        description : description,
        catergory : catergory,
        stock: stock,
        price: price,
        image : img 
    })

    newProduct.save();
    res.redirect("/manageP")

})

// Reports
app.get("/reports",function(req,res){

    Order.find({},function(err,data){
        rows=[]
        data.forEach(function(detail){
            var orderarr = [detail.product , detail.quantity]
        rows.push(orderarr);
        })
    })
    
        res.render("Reports",{row: JSON.stringify(rows)});
     
    })
    
    

app.get("/orders",function(req,res){
    Order.find({},function(err,data1){
        Product.find({},function(err,data2){
            res.render("Orders",{orderdetails:data1,productdetails:data2})
        })
    
    })
})

app.post("/orders",function(req,res){
    const id = req.body.selected;
    let product = "";
    const quantity = req.body.qty;
    const name = req.body.Name;
    let image = "";
    let price = 0;
    Product.findById(id,function(err,data){
        if(!err){
            price = data.price * quantity;
            product = data.name;
            image = data.image;
            const arr=[data.product,data.quantity]
        rows.push(arr);
            
        }
        const newOrder = new Order({
            product : product,
          quantity: quantity,
          price: price,
          user : name ,
          image : image
        })
        newOrder.save();
        
        
    })
    res.redirect("/orders")
})



// Logout
app.get("/logout",function(req,res){
    res.render("Loginpage");
})

app.get("/media",function(req,res){
    Product.find({},function(err,data){
    res.render("Media",{productdetails:data});
    })
})
// delete for User



app.post("/deleteU",function(req,res){
    const del = req.body.delete;
    User.findByIdAndRemove(del, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
              res.redirect("/manageU");
            }
          });
    }
);



// delete for Product
app.post("/deleteP",function(req,res){
    const del = req.body.delete;
    Product.findByIdAndRemove(del, function(err){
            if (!err) {
              console.log("Successfully deleted checked item.");
              res.redirect("/manageP");
            }
          });
    }
);


// Server


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server is running")
})
