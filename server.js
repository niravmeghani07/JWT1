require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const port = 1000;
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//sample data
const data = [
    {
        username: 'Nirav',
        password: 'abcxyzt',
        title: 'Post 1'
    },
    {
    username: 'Kyle',
    password: '1234abcd',
    title: 'Post 2'
    },
    {
     username: 'Vinod',
     password: 'bxcd56&9',
     title: 'Mechanic'
    }
]

app.get('/',(req,res)=>{
    res.redirect('/login');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

// Retrieving the data authorized to a perticular user after comparing tokens
app.get('/posts',authenticateToken,(req,res)=>{
    const user = data.find(item => item.username === req.user.name);

    console.log(user);

    if (user.title === 'Supervisor') {
        res.json(data.filter(item => item.title === 'Mechanic'));
    } else if (user.title === 'Mechanic') {
        res.json(data.filter(item => item.username === req.user.name));
    } else {
        res.sendStatus(403);
    }
})

//Creating a JWT of a user after logging in
app.post('/login',(req,res)=>{
    const username= req.body.username;
    const password = req.body.password;
    const user = data.find(item => item.username === username);
    const name = {name: user.username};
 
    if((!user) || (user.password !== password)){
        return res.sendStatus(404).json({message: 'Authentication Failed'});
    }
    
    console.log('Entered Username: ',username);
    const access_token = jwt.sign(name, process.env.ACCESS_SECRET_KEY);
    res.json({access_Token: access_token})
})


// Middleware to authenticate tokens from the authorization header of request
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err,user)=>
    {
        if(err) return res.sendStatus(403)
        req.user = user;
        next();
    })

}

app.listen(port,()=>{
    console.log('Connected to server');
});
