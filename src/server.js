const express = require("express")
const nunjucks = require("nunjucks")
const routes = require('./routes')
const methodOverride = require('method-override')

const server = express()

//Usado para poder receber os dados para o back, quando dá submit no form por exemplo
server.use(express.urlencoded({extended: true}))
server.use(express.static("public"))
//methodOverride é usado para sobreescrever o method post, por exemplo para se poder usar o put
//importante também deixar acima do routes para sobreescrever e depois acessar a rota correta
server.use(methodOverride('_method'))
server.use(routes)

server.set("view engine", "njk")

nunjucks.configure("src/app/views", {
  express: server,
  autoescape: false,
  noCache: true
})

server.listen(5000, function() {
  console.log("server is running")
})

server.use(function(req, res) {
  res.status(404).render("not-found");
});