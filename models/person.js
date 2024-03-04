const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB: ', error.message)
  })

const numberFormat = (v) => /^\d{2,3}-\d+$/.test(v)

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  number: { type: String, required: true, minlength: 8, validate: { validator: numberFormat, message: props => `${props.value} is not in a valid format` } },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)