const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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

let persons = [
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
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const now = new Date().toString()
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${now}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)


    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

function getRandomID(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: getRandomID(0, 10000),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})