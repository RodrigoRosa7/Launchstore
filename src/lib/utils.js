const Intl = require("intl");

module.exports = {
    date(timestamp) {
      const date = new Date(timestamp)

      //depois que foi colocado trigger pra update no banco
      //pode ser removido o UTC de getUTCFullYer e outros
      const year = date.getFullYear()
      const month = `0${date.getMonth() + 1}`.slice(-2)
      const day = `0${date.getDate()}`.slice(-2)
      const hour = date.getHours()
      const minute = date.getMinutes()

      return {
        day,
        month,
        year,
        hour,
        minute,
        iso: `${year}-${month}-${day}`,
        birthDay: `${day}/${month}`,
        format: `${day}-${month}-${year}`
      }
    },

    formatPrice(price){
      return new Intl.NumberFormat('pt-BR',{
          style: 'currency',
          currency: 'BRL'
      }).format(price/100)
    }
}