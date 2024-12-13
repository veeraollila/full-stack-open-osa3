require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.delete('/api/persons/:id', async (req, res, next) => {
    try {
      const id = req.params.id
      const result = await Person.deleteOne({ _id: id })
      if (result.deletedCount > 0) {
        console.log(`deleted person with id ${id} from phonebook`)
        res.status(204).end()
      } else {
        res.status(404).send({ error: 'person not found' })
      }
    } catch (error) {
      next(error)
    }
})

app.post("/api/persons/", async (req, res, next) => {
    const body = req.body
    
    if (!body.name || !body.number) {
        return res.status(400).json({
          error: "content missing",
        })
    }

    const nameExists = persons.some((p) => p.name === body.name)
    if (nameExists) {
        return res.status(400).json({
          error: "name must be unique",
        })
    }

    try {
        const updatedPerson = await Person.findOneAndUpdate(
          { name: body.name },
          { number: body.number },
          { new: true, upsert: true }
        )
        console.log(`added or updated ${body.name} number ${body.number} in phonebook`)
        res.json(updatedPerson)
    } catch (error) {
        next(error)
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})