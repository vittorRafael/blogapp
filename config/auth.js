const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/Usuario')

module.exports = (passport) => {
  passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
    Usuario.findOne({ email: email }).lean().then((usuario) => {
      if (!usuario) {
        return done(null, false, { message: 'Essa conta não existe' })
      }
      bcrypt.compare(senha, usuario.senha, (erro, batem) => {
        if (batem) {
          return done(null, usuario)
        } else {
          return done(null, false, { message: 'Senha incorreta' })
        }
      })

    })
  }))
  passport.serializeUser((usuario, done) => {
    done(null, usuario)
  })
  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario)
    })
  })
}