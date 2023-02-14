// Carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const admin = require('./routes/admin');
const usuarios = require('./routes/usuario');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')
const Postagem = require('./models/Postagem')
const passport = require('passport')
require('./config/auth')(passport)


//Configurações
//sessao
app.use(session({
  secret: "cursodenode",
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null;
  next();
})
//config url
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//config handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
//public
app.use(express.static(path.join(__dirname, 'public')));
//mongoose
mongoose.connect("mongodb+srv://vittorRafael:rafas4650@blogapp.bobiuww.mongodb.net/?retryWrites=true&w=majority").then(() => {
  console.log('conectado ao mongo')
}).catch((err) => {
  console.log('Erro ao se conectar: ' + err)
})


//Rotas
app.get('/', (req, res) => {
  Postagem.find().populate('categoria').sort({ data: "desc" }).lean().then((postagens) => {
    res.render('index', { postagens });
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno')
    res.redirect('/404')
  })
})
app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
    if (postagem) {
      res.render('postagem/index', { postagem: postagem })
    } else {
      req.flash('error_msg', 'Postagem não existe')
      res.redirect('/')
    }
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno')
    res.render('/')
  })
})
app.get('/404', (req, res) => {
  res.send('Error 404')
})
app.get('/posts', (req, res) => {
  res.send('lista de posts');
});
app.use('/admin', admin);
app.use('/usuarios', usuarios)

//Outros
const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log('servidor rodando na porta ' + port);
});
