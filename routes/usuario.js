const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Usuario = require('../models/Usuario')
const passport = require('passport')

router.get('/registro', (req, res) => {
  res.render('usuarios/registro')
})
router.post('/registro', (req, res) => {
  let erros = []
  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ text: "Nome Inválido!" })
  }
  if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    erros.push({ text: "Email Inválido!" })
  }
  if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
    erros.push({ text: "Senha Inválida!" })
  }
  if (req.body.senha.length < 4) {
    erros.push({ text: "Senha curta!" })
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ text: "As senhas estão diferentes!" })
  }
  if (erros.length > 0) {
    res.render('usuarios/registro', { erros })
  } else {
    Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
      if (usuario) {
        req.flash('error_msg', 'Já existe uma conta com esse email, tente novamente!')
        res.redirect('/usuarios/registro')
      } else {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.senha, salt);

        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: hash
        })

        novoUsuario.save().then(() => {
          req.flash('success_msg', 'Usuário cadastrado com sucesso')
          res.redirect('/')
        }).catch((err) => {
          req.flash('error_msg', 'Houve um erro intero');
          res.redirect('/')
        })
      }
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/')
    })
  }
})
router.get('/login', (req, res) => {
  res.render('usuarios/login')
})
router.post('/login', (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true
  })(req, res, next)
})
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    req.flash('success_msg', 'Sessão encerrada com sucesso, até depois!')
    res.redirect('/')
  })
})


module.exports = router