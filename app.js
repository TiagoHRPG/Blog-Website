// Carregando módulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require("body-parser");
    const app = express();
    const admin = require("./routes/admin.js")
    const path = require("path") // serve para manipular pastar e diretorios
    const mongoose = require("mongoose");
    const session = require("express-session")
    const flash = require("connect-flash") // é um tipo de sessão que desaparece quando o usuário recarrega a pagina
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const db = require("./config/db")

// Configurações
    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") // criando uma variavel glocal com "locals"
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null//armazenar dados do usuario logado
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.connect(db.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
            console.log("Banco conectado com sucesso")
        }).catch((err) => {
            console.log("Falha ao se conectar com o banco: "+err)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public"))) // a pasta que ta guardando os arquivos estatios é a public

        app.use((req, res,next) => {  //middleware 
            console.log("OI EU SOU UM MIDDLEWARE");
            next();
        })
// Rotas
        app.get('/', (req, res) => {
            Postagem.find().populate('categoria').sort({data:"desc"}).then((postagens) => {
                Postagem.findOne()
                    res.render("index", {postagens: postagens})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/404")
            })
            
        })

        app.get("/postagem/:slug", (req,res) =>{
            Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
                if(postagem){
                    res.render("postagem/index", {postagem: postagem})
                }else{
                    req.flash("error_msg", "Esta postagem não existe")
                    res.redirect("/")
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
        })

        app.get("/categorias", (req, res) => {
            Categoria.find().lean().then((categorias) => {
                res.render("categorias/index", {categorias: categorias})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            })
        })

        app.get("/categorias/:slug", (req, res) => {
            Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
                if(categoria){
                    
                    Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    }).catch((err) =>{
                        req.flash("error_msg", "Houve um erro ao listar os posts")
                        res.redirect("/")
                    })
                }else{
                    req.flash("error_msg", "Essa categoria não existe")
                    res.redirect("/")
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria")
                res.redirect("/")
            })
        })

        app.get("/404", (req,res) => {
            res.send("ERRO")
        })
    
    app.use('/admin', admin); //prefixo para um grupo de rotas 
    app.use('/usuarios', usuarios)

// Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando! ");
});