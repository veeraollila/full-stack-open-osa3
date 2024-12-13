require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')
const path = require('path')

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

app.get('/api/persons', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', async (req, res, next) => {
    try {
        const persons = await Person.find({})
        res.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${new Date()}</p>`)
    } catch (error) {
        next(error)
    }
})

app.get('/api/persons/:id', async (req, res, next) => {
    try {
        const person = await Person.findById(req.params.id)
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

app.use(express.static('dist'))

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

app.post('/api/persons/', async (req, res, next) => {
    const body = req.body
    
    if (!body.name || body.name.length < 3) {
        return res.status(400).json({
            error: 'name must be at least 3 characters long'
        })
    }
    
    if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
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

app.put('/api/persons/:id', async (req, res, next) => {
    const id = req.params.id
    const body = req.body
    
    if (!body.name || body.name.length < 3) {
        return res.status(400).json({
            error: 'name must be at least 3 characters long'
        })
    }
    
    if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }
    
    try {
        const updatedPerson = await Person.findByIdAndUpdate(
            id,
            { name: body.name, number: body.number },
            { new: true }
        )
        
        if (!updatedPerson) {
            return res.status(404).json({
                error: 'person not found'
            })
        }
        
        console.log(`updated ${body.name} number ${body.number} in phonebook`)
        res.json(updatedPerson)
    } catch (error) {
        next(error)
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})