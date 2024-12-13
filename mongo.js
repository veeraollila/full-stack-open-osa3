const mongoose = require('mongoose')

const password = process.argv[2]
const action = process.argv[3]
const name = process.argv[4]
const number = process.argv[5]
const url = 'mongodb+srv://fullstack:' + password + '@cluster0.ccw9j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    required: true
  }
})

const Person = mongoose.model('Person', personSchema)

if (action === 'get') {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (action === 'add') {
  const name = process.argv[4]
  const number = process.argv[5]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else if (action === 'delete') {
  Person.deleteOne({ name: name }).then(result => {
    console.log(`deleted ${name} from phonebook`)
    mongoose.connection.close()
  })
} else if (action === 'edit') {
  Person.findOneAndUpdate({ name: name }, { number: number }, { new: true }).then(result => {
    console.log(`changed ${name}'s number to ${number}`)
    mongoose.connection.close()
  })
}

module.exports = Person