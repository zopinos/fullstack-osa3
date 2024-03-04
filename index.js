require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('post-data', (req) => {
    if (req.method === "POST") {
        return JSON.stringify(req.body)
    }
})

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))
app.use(cors())

/* let persons = [
    {
        id: 1,
        name: "Pekka1",
        number: "1234"
    },
    {
        id: 2,
        name: "Pekka2",
        number: "4567"
    },
    {
        id: 3,
        name: "Pekka3",
        number: "7890"
    },
    {
        id: 4,
        name: "Pekka4",
        number: "1357"
    },
] */

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            if (persons) {
                response.json(persons)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    /* const id = Number(request.params.id)
    const person = persons.find(person => person.id === id) */

    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
    /* console.log("Finding a person was rejected: ", error.message)
    response.status(400).send({ error: 'malformatted id' }) */
    /* if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    } */
})

app.get('/info', (request, response, next) => {
    const now = new Date().toString()

    Person.find({})
        .then(persons => {
            response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${now}</p>`)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    const person = new Person({
        name: name,
        number: number
    })

    person.save()
        .then(savedPerson => {
            if (person) {
                response.json(savedPerson)
            } else {
                response.status(400).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})