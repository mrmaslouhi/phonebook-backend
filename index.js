const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const mongoose = require('mongoose')
const Person = require('./models/person')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.connect(url)

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

let numberOfPeople

app.get('/api/persons', (request, response) => {
  Person.find({}).then(returnedPersons => {
    response.json(returnedPersons)
  })
})

app.get('/info', (request, response) => {
  Person.estimatedDocumentCount({})
    .then(personCount => {
      response.send(`<p>Phonebook has info for ${personCount} people</p>`)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(returnedPerson => {
      if (returnedPerson) {
        response.json(returnedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      response.status(500).send({ error: 'malformatted id '})
    })
  
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body

  if (!body.number || !body.name) {
    return response.status(404).json({
      error: 'content missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    important: body.important || false,
  })

  person.save()
    .then(p => {
      response.json(p)
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

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
    important: body.important || false,
  }

  Person.findByIdAndUpdate(
     request.params.id,
     person,
     { new: true, runValidators: true, context: 'query' }
    )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

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

const port = 3001
app.listen(port, () => {
  console.log("Server is running on port", port)
})
