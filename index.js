const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
] 

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`  
        <p>Phonebook has info for ${persons.length} people
        <br>
        ${new Date()} Eastern European Standard Time
        </p>
`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

const generateId = () => {
  const maxId = persons.length > 0
  ? Math.max(...persons.map(p => Number(p.id)))
  : 0
  return String(maxId + 1)  
}

app.post('/api/persons/', (request, response) => {
  const body = request.body

  if (!body.number || !body.name) {
    return response.status(404).json({
      error: 'content missing'
    })
  } else if (persons.some(p => p.name === body.name)) {
    return response.status(404).json({
      error: 'person already in phonebook'
    })    
  } 

  const person = {
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false,
    id: generateId()
  }

  persons = persons.concat(person)

  response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.json(persons)
})




const port = 3001
app.listen(port, () => {
    console.log("Server is running on port", port)
})