const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Categoria = require('../models/Categoria')
const Postagem = require('../models/Postagem')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
  res.render('admin/index');
});
router.get('/posts', eAdmin, (req, res) => {
  res.send('Página de posts');
});
router.get('/categorias', eAdmin, (req, res) => {
  Categoria.find().lean().sort({ date: 'desc' }).then((categorias) => {
    res.render('admin/categorias', { categorias: categorias });
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao listar as categorias')
    res.redirect('/admin')
  })
});
router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias');
});
router.post('/categorias/nova', eAdmin, (req, res) => {

  var erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ text: "Nome Inválido" })
  }
  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({ text: "Slug Inválido" })
  }
  if (req.body.nome.length < 2) {
    erros.push({ text: "Nome da categoria muito pequeno" })
  }
  if (erros.length > 0) {
    res.render('admin/addcategorias', { erros: erros })
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
    new Categoria(novaCategoria).save().then(() => {
      req.flash('success_msg', "Categoria criada com sucesso!")
      res.redirect("/admin/categorias")
    }).catch((err) => {
      req.flash('error_msg', "Houve um erro ao salvar a categoria, tente novamente!")
      res.redirect('/admin')
    })
  }
})
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
    res.render('admin/editcategorias', { categoria: categoria })
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/admin/categorias")
  })
})
router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id }).then((categoria) => {
    let erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
      erros.push({ text: "Nome invalido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
      erros.push({ text: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
      erros.push({ text: "Nome da categoria muito pequeno" })
    }
    if (req.body.nome == categoria.nome && req.body.slug == categoria.slug) {
      erros.push({ text: 'Nome e slug igual ao anterior' })
    }
    if (erros.length > 0) {
      Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria, erros: erros })
      }).catch((err) => {
        req.flash("error_msg", "Erro ao pegar os dados")
        res.redirect("admin/categorias")
      })

    } else {


      categoria.nome = req.body.nome
      categoria.slug = req.body.slug

      categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso!")
        res.redirect("/admin/categorias")
      }).catch((err) => {
        req.flash("error_msg", "Erro ao salvar a edição da categoria")
        res.redirect("admin/categorias")
      })

    }
  }).catch((err) => {
    req.flash("error_msg", "Erro ao editar a categoria")
    req.redirect("/admin/categorias")
  })
})
router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id }).then(() => {
    req.flash('success_msg', 'Categoria deletada com sucesso')
    res.redirect('/admin/categorias')
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao deletar categorias')
    res.redirect('/admin/categorias')
  })
})
router.get('/postagens', eAdmin, (req, res) => {
  Postagem.find().lean().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
    res.render('admin/postagens', { postagens: postagens });
  }).catch((err) => {
    req.flash('error_msg', `Houve um erro ao listar as postagens: ${err}`)
    res.redirect('/admin')
  })
})
router.get('/postagens/add', eAdmin, (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('admin/addpostagens', { categorias: categorias })
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao carregar as categorias')
  })
})
router.post('/postagens/nova', eAdmin, (req, res) => {
  var erros = []
  if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
    erros.push({ text: "Título Inválido" })
  }
  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({ text: "Descrição Inválida" })
  }
  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({ text: "Descrição Inválida" })
  }
  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({ text: "Slug Inválido" })
  }
  if (req.body.titulo.length < 2) {
    erros.push({ text: "Titulo da postagem muito pequeno" })
  }
  if (req.body.descricao.length < 5) {
    erros.push({ text: "Descrição da postagem muito pequena" })
  }
  if (req.body.categoria == "00") {
    erros.push({ text: "Escolha uma categoria" })
  }
  if (req.body.categoria == "0") {
    erros.push({ text: "Nenhuma categoria registrada" })
  }
  if (erros.length > 0) {
    res.render('admin/addpostagens', { erros: erros })
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }

    new Postagem(novaPostagem).save().then(() => {
      req.flash('success_msg', 'Postagem criada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro com o salvamento da mensagem')
      res.redirect('/admin/postagens')
    })
  }
})
router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render('admin/editpostagens', { postagem: postagem, categorias: categorias })
    }).catch((err) => {
      req.flash("error_msg", "Erro ao mostrar as categorias")
      res.redirect("/admin/postagens")
    })
  }).catch((err) => {
    req.flash('error_msg', 'Essa postagem não existe')
    res.redirect("/admin/postagens")
  })
})
router.post('/postagem/edit', eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id }).then((postagem) => {
    var erros = []
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
      erros.push({ text: "Título Inválido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
      erros.push({ text: "Descrição Inválida" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
      erros.push({ text: "Conteudo Inválido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
      erros.push({ text: "Slug Inválido" })
    }
    if (req.body.titulo.length < 2) {
      erros.push({ text: "Titulo da postagem muito pequeno" })
    }
    if (req.body.descricao.length < 5) {
      erros.push({ text: "Descrição da postagem muito pequena" })
    }
    if (req.body.categoria == "00") {
      erros.push({ text: "Escolha uma categoria" })
    }
    if (req.body.categoria == "0") {
      erros.push({ text: "Nenhuma categoria registrada" })
    }
    if (erros.length > 0) {
      Postagem.findOne({ _id: req.body.id }).lean().then((postagem) => {
        res.render("admin/editpostagens", { postagem: postagem, erros: erros })
      }).catch((err) => {
        req.flash("error_msg", "Erro ao pegar os dados")
        res.redirect("admin/postagens")
      })
    } else {
      postagem.titulo = req.body.titulo
      postagem.slug = req.body.slug
      postagem.descricao = req.body.descricao
      postagem.conteudo = req.body.conteudo
      postagem.categoria = req.body.categoria
      postagem.date = Date.now()

      postagem.save().then(() => {
        req.flash("success_msg", "postagem editada com sucesso!")
        res.redirect("/admin/postagens")
      }).catch((err) => {
        req.flash("error_msg", "Erro ao salvar a edição da postagem")
        res.redirect("admin/postagens")
      })
    }
  })
})
router.post("/postagens/deletar", eAdmin, (req, res) => {
  Postagem.deleteOne({ _id: req.body.id }).then(() => {
    req.flash('success_msg', 'Postagem deletada com sucesso')
    res.redirect('/admin/postagens')
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao deletar o post')
    res.redirect('/admin/postagens')
  })
})

module.exports = router;
