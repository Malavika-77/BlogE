const express= require("express");
const session = require("express-session");
var app= express();
const bodyParser= require("body-parser");
const ejs = require('ejs'); 
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const path = require('path');
const PORT=3000;
const mongoose=require('mongoose');
const { Console } = require("console");
//////////////////////////////////////////////////////////////////

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// USE SESSION MIDDLEWARE
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));


//DATABASE CONNECTION TO SITE

mongoose.connect("mongodb://localhost:27017/site")
.then(()=>{
    console.log("site connection established");
})
.catch((error)=>{
    console.log("site connection not established");
   
});

//DATABASE1 SCEHMA GENERATION

const userschema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    mail:{
        type:String,
        required:true
    },
    active:{
        type:Number
    },
   
});
console.log("userschema is generated");

//DATABASE1 MODEL CREATION

const signup=mongoose.model('signup',userschema);
console.log("model is created");




//DATABASE2 SCHEMA

const userschema2= new mongoose.Schema({
    authorname:{
        type:String,
        required:true
    },
    about1:{
        type: String,
        required:true
    },
    about2:{
        type:String,
        required:true
    }
});
console.log("userschema2 is generated");


//DATABASE2 MODEL CREATION

const account=mongoose.model('account',userschema2);
console.log("model is created");



//DATABSE 3 IS CREATION

const blogSchema = new mongoose.Schema({
    authorname: String,
    blogname: String,
    blogtype: String,
    write: String,
    imagePath: String
}, { timestamps: true });


console.log("BLODSCHEMA is created");

//DATABASE2 MODEL CREATION

const blog=mongoose.model('blog',blogSchema);
console.log("model is created");





//HOME PAGE 

// Route for the home page
app.get("/", async (req, res) => {
    try {
        // Fetch the latest 6 blog posts from the database
        const latestBlogs = await blog.find().sort({ createdAt: -1 }).limit(20);

        // Render the home page with the fetched blog posts
        res.render("home", { latestBlogs: latestBlogs });
    } catch (error) {
        console.error("Error fetching latest blogs:", error.message);
        res.status(500).send("Error fetching latest blogs: " + error.message);
    }
});


// Route for the home page///////////////////////////////////////////////////////////
app.get("/author/:authorname", async (req, res) => {
    const authorname = req.params.authorname;

    try {
        if (!authorname) {
            
            console.log("No authorname provided in the query parameters");
        }

        // Fetch blog data from the database based on the authorname
        const blogs = await blog.find({ authorname: authorname }).sort({ createdAt: -1 });
        console.log("sucessfully rendere");
        // Render the gotoblog.ejs template with the fetched blog data
        return res.render("gotoblog", { blogs: blogs });
       
    } catch (error) {
        console.error("Error GOTOBLOS blogs:", error.message);
        return res.status(500).send("Error GOTOBLOGS blogs: " + error.message);
    }
});

     
//SIGN UP PAGE

app.post("/signup",async(req,res)=>{

const username=req.body.username;
const password=req.body.password;
const conpassword=req.body.conpassword;
const mail=req.body.mail;


        if(!username||!password||!conpassword||!mail){
            console.log("error occured in checking signup page ");
            return res.status(404).send("error occured in signup page");
        }
        if(password !== conpassword){
            console.log("incorrect password");
            return res.send(" incorrect password");

        }
       
        if(password){
            var regex = /^(?=.*[a-zA-Z])(?=.*[^\w\s]).{4,}$/;
            if (!regex.test(password)) {
                console.log("invalid passwords");
               return res.status(400).send('invalid password');
        }}
       
        
    try{
                 const saving=await signup.findOne({username:username,password:password});
                 
                            if(saving){
                                                      console.log("user exists");
                                         }
                                         else{
                                                    const signupdetails=new signup({
                                                                            username:username,
                                                                            password:password,
                                                                            mail:mail,
                                                                            active:0
                                                            });
                    await signupdetails.save();
                    console.log("saved sucessfully");

                    return res.redirect("/login.html");
                                            }
                                        }

catch(error){
    console.error("Error on signup:", error.message);
    return res.status(500).send("Error in signup: " + error.message);
}


});

//FORGOT PASSWORD


app.post("/forgot",async(req,res)=>{
  

    const username=req.body.username;
    const mail=req.body.mail;

    if(!username||!mail){
        console.log("please enter the required fields");
      return res.send("please enter the required fields");
    }
try{

const updating=await signup.findOne({username:username,mail:mail});
if(updating){
    req.session.username = username;
    return res.redirect("/changepass.html");


}
console.log("incorrect username or mail id");

}

catch(error){
    console.error("Error on signup:", error.message);
    return res.status(500).send("Error in signup: " + error.message);
}



});

//NEW PASSWORD SETTING
app.post("/changepass",async(req,res)=>{

      
    
const password=req.body.password;
const cpassword=req.body.cpassword;
 // Retrieve username from session
 const username = req.session.username;
 console.log("Username:", username);



if(!password||!cpassword){
    console.log("please enter the fields");
    return res.send("please enter correct fields");
}
if(password!==cpassword){
    console.log("please fill the fields");
    return res.send("please fill thefields");
}
try{
        const updating= await signup.findOne({username:username});
        if(updating){
            updating.password=password;
            await updating.save();
            console.log("Password updated successfully");
            return res.redirect("/login.html");
        }
        console.log("User not found");
        return res.status(404).send("User not found");
}

catch(error){
    console.error("Error on signup:", error.message);
    return res.status(500).send("Error in signup: " + error.message);
}

});


///LOGIN PAGE TO ACCOUNT SETTING.CHECK ACTIVE=1 FOR ACCESSING THE PROFILE PAGE

app.post("/login",async(req,res)=>{

const username=req.body.username;
const password=req.body.password;
const imagePath = `${username}.jpg`;
if(!username||!password){
    console.log("please fill the fields");
    return res.send("please fill thefields");
}
if(password){
    var regex = /^(?=.*[a-zA-Z])(?=.*[^\w\s]).{4,}$/;
            if (!regex.test(password)) {
                console.log("invalid passwords");
               return res.status(400).send('invalid password');
        }}

        try {
            const check = await signup.findOne({ username: username, password: password });
            if (check) {
                if (check.active === 0) {
                    console.log("User account not found. Active status:", check.active);
                    return res.redirect("/account.html");
                } else if (check.active === 1) {
                    
                    console.log("User account found. Active status:", check.active);
                    const checkactive=await account.findOne({authorname:username});
                    if(checkactive){
                    
                    return res.render("profile", {
                        authorname: checkactive.authorname,
                        about1: checkactive.about1,
                        about2: checkactive.about2,
                        imagePath: imagePath,
                        
                    });
                }
                    
                }
                
            } else {
                console.log("User not found.");
                return res.status(404).send("User not found.");
            }
        }

catch(error){
    console.error("Error on LOGIN:", error.message);
    return res.status(500).send("Error in LOGIN: " + error.message);
}


});

///ACCOUNT PAGE 
app.post("/accountsave",async(req,res)=>{
const authorname=req.body.authorname;
const username=req.body.authorname;
const about1=req.body.about1;
const about2=req.body.about2;


if(!authorname||!about1||!about2){

    console.log("please fill the fields");
    return res.send("please fill thefields");
}
try{
const accountsave= await account.findOne({authorname:authorname,about1:about1,about2:about2});
if(accountsave){
    Console.log("account exist");
}
    const newAccount = new account({
        authorname: authorname,
        about1: about1,
        about2: about2
    });
    await newAccount.save();
    console.log("account saved sucessfully");
    const setfield= await signup.findOne({username:username});
        if(setfield){
                      setfield.active=1;
                      await setfield.save();
                      console.log('active',setfield.active);
                      return res.redirect("/login.html");
        }
    

}

catch(error){
    console.error("Error on account saving:", error.message);
    return res.statuss(500).send("account saving " + error.message);
}



});



////CREATE B;PG PAGE

app.post("/createblog", upload.single('file'), async (req, res) => {
    const authorname = req.body.authorname;
    const blogname = req.body.blogname;
    const blogtype = req.body.blogtype;
    const write = req.body.write;
    const imagePath = req.file.filename; // Use filename instead of path since multer saves the file in the 'uploads' folder

    if (!authorname || !blogname || !blogtype || !write) {
        console.log('Fill all the fields');
        return res.send("Fill all the fields to create the blog");
    }

    try {
        const existingBlog = await blog.findOne({ authorname, blogname, blogtype, write });

        if (existingBlog) {
            console.log("Blog already exists");
            return res.status(200).send("Blog already exists");
        } else {
            // Save new blog
            const newBlog = new blog({
                authorname,
                blogname,
                blogtype,
                imagePath: `uploads/${imagePath}`, // Save the image path relative to the 'uploads' folder
                write
            });
            await newBlog.save();
            console.log("Blog saved successfully");
            return res.redirect("/myblogs"); // Redirect to the page where blogs are displayed
        }
    } catch (error) {
        console.error("Error saving blog:", error.message);
        return res.status(500).send("Error saving blog: " + error.message);
    }
});



///MY BLOG PAGE


app.get("/myblogs", async (req, res) => {
    const authorname = req.query.authorname;

    try {
        if (!authorname) {
            
            console.log("No authorname provided in the query parameters");
        }

        // Fetch blog data from the database based on the authorname
        const blogs = await blog.find({ authorname: authorname }).sort({ createdAt: -1 });
        console.log("sucessfully rendere");
        // Render the gotoblog.ejs template with the fetched blog data
        return res.render("gotoblog", { blogs: blogs });
       
    } catch (error) {
        console.error("Error fetching blogs:", error.message);
        return res.status(500).send("Error fetcshing blogs: " + error.message);
    }
});
///////////////////////////////////////////////////////////
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});