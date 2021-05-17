const express = require("express")
const router = express.Router() // cria rotas em arquivos separados
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin") //apenas a função eAdmin

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})


//listando categorias
router.get('/categorias', eAdmin, (req,res) => {
    Categoria.find().lean().sort({date:'desc'}).then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias}) //passando as categorias do mongo para a pagina
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})
//pagina para adicionar categorias
router.get('/categorias/add', eAdmin, (req,res) => {
    res.render("admin/addcategorias")
})

//adicionando caetgorias e validando
router.post("/categorias/nova", eAdmin, (req,res) => {
    //validação de novas categorias
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias.handlebars", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!") //passando o texto para a variavel global success_msg
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!") //passando o texto para a variavel global error_msg
            res.redirect("/admin")
        })

    }

    
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editcategorias.handlebars", {categoria: categoria.toJSON()})
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("/admin/categorias")
    })
    
})

router.post("/categorias/edit", eAdmin, (req,res) =>{

    var errosEdit = []

    if(!req.body.nome){
        errosEdit.push({texto: "Nome inválido"})
    }
    if(!req.body.slug){
        errosEdit.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        errosEdit.push({texto: "Nome da categoria é muito pequeno"})
    }
    
    
    if(errosEdit.length > 0){
        res.render("admin/editcategorias", {errosEdit: errosEdit})
    }
    else{
        Categoria.findOne({_id: req.body.id}).then((categoria) =>{

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
    
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
                res.redirect("/admin/categorias")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            console.log(err)
            res.redirect("/admin/categorias")
        })
    }
})
// Deletando categorias (forma mais segura)
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res) => {

    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro na listagem das postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add",  eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

//criando nova postagem e validando
router.post("/postagens/nova", eAdmin, (req, res) => {

    //validação do formulário
    var erros = []

    if(!req.body.titulo){
        erros.push({texto: "Título inválido"})
    }

    if(!req.body.slug){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.descricao){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo){
        erros.push({texto: "Conteúdo inválido"})
    }

    if(req.body.conteudo.length < 5){
        erros.push({texto: "Conteúdo da postagem é muito pequeno"})
    }

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias) => {
            res.render("admin/addpostagem", {erros: erros, categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um eror ao carregar o formulário")
            res.redirect("/admin/postagens")
        })
        
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
    

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a postagem")
            res.redirect("/admin/postagens")
        })
    }

})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {

    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", eAdmin, (req, res) => {
    //validação do formulário
    var erros = []

    if(!req.body.titulo){
        erros.push({texto: "Título inválido"})
    }

    if(!req.body.slug){
        erros.push({texto: "Slug inválido"})
    }

    if(!req.body.descricao){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo){
        erros.push({texto: "Conteúdo inválido"})
    }

    if(req.body.conteudo.length < 5){
        erros.push({texto: "Conteúdo da postagem é muito pequeno"})
    }

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {erros: erros, categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a postagem")
            res.redirect("/admin/postagens")
        })
    
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            postagem.data = new Date

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Erro interno")
                res.redirect("/admin/postagens")
            })

        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro ao salvar a edição")
            res.redirect("/admin/postagens")
        })
    }

})

// rota para deletar postagens
router.post("/postagens/deletar", eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router