const {formatPrice, date} = require('../../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
  create(req, res){
    //Pegar categorias por promise
    Category.all()
    .then(function(results){
      const categories = results.rows

      return res.render('products/create.njk', {categories})

    }).catch(function(err){
      throw new Error(err)
    })
  },

  async edit(req, res){
    let results = await Product.find(req.params.id)
    const product = results.rows[0]

    if(!product) return res.send("Product not found!")

    product.old_price = formatPrice(product.old_price)
    product.price = formatPrice(product.price)

    //get categories
    results = await Category.all()
    const categories = results.rows

    //get files
    results = await Product.files(product.id)
    let files = results.rows
    files = files.map(file => ({
      ...file,
      src:`${req.protocol}://${req.headers.host}${file.path.replace("public","")}`
    }))

    return res.render('products/edit.njk', {product, categories, files})
  },

  async show(req,res){
    let results = await Product.find(req.params.id)
    const product = results.rows[0]

    if(!product) return res.send("Produto não encontrado")

    const {day, month, hour, minute} = date(product.update_at)

    product.published = {
      day: `${day}/${month}`,
      hour: `${hour}h${minute}`
    }

    product.oldPrice = formatPrice(product.old_price)
    product.price = formatPrice(product.price)

    results = await Product.files(product.id)
    let files = results.rows

    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }))

    return res.render('products/show.njk', {product, files})
  },

  async post(req, res){
    const keys = Object.keys(req.body)

    for (const key of keys) {
      if(req.body[key] == "")
        return res.send("Preencha todos os campos corretamente")
    }

    if(req.files.length == 0)
      return res.send("Por favor inclua pelo menos uma imagem!")

    let results = await Product.create(req.body)
    const productId = results.rows[0].id

    const filesPromise = req.files.map(file => File.create({...file, product_id: productId}))
    await Promise.all(filesPromise)

    return res.redirect(`/products/${productId}`)
  },

  async put(req, res){
    const keys = Object.keys(req.body)

    for(const key of keys){
      if(req.body[key] == "" && key != "removed_files")
        return res.send("Preencha todos os campos corretamente")
    }

    if(req.files.length > 0) {
      const newFilesPromise = req.files.map(file => File.create({...file, product_id: req.body.id}))

      await Promise.all(newFilesPromise)
    }

    if(req.body.removed_files){
      const removedFiles = req.body.removed_files.split(",") // [1,2,3,]
      const lastIndex = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1) // [1,2,3]

      const removedFilesPromises = removedFiles.map(id => File.delete(id))

      await Promise.all(removedFilesPromises)
    }

    req.body.price = req.body.price.replace(/\D/g,"")

    if(req.body.old_price != req.body.price){
      const oldProduct = await Product.find(req.body.id)

      req.body.old_price = oldProduct.rows[0].price
    }

    await Product.update(req.body)

    return res.redirect(`/products/${req.body.id}`)
  },

  async delete(req, res){
    await Product.delete(req.body.id)

    return res.redirect('/products/create')
  }
}