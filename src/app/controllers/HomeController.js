const {formatPrice} = require('../../lib/utils')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
  async index (req, res){
    let results = await Product.all()

    const products = results.rows

    if(!products) return res.send("Produtos não encontrados")

    async function getImage(productId){
      let results = await Product.files(productId)
      let files = results.rows
  
      files = files.map(file => `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`)

      // return files[0]
      try {
        return files = files[0].replace(/\\/g, '/')
      } catch {
        return files[0]
      }
    }

    const productsPromise = products.map(async product => {
      product.img = await getImage(product.id)
      product.oldPrice = formatPrice(product.old_price)
      product.price = formatPrice(product.price)
      return product
    }).filter((product, index) => index > 2 ? false : true) //filter pra pegar só 3 produtos

    const lastAdded = await Promise.all(productsPromise)

    return res.render('home/index', {products: lastAdded})
  }
}
