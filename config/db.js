if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://Tiagohrpg:06072002@blogapp.1gpdc.mongodb.net/myFirstDatabase?"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}