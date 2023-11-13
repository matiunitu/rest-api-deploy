const express = require('express')
 // require -> commonJS
const movies = require("./movies.json")
const crypto = require("node:crypto")
const { validatePartialMovie } = require('./movies')

const app = express()
app.use(express.json())
app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express


//recuperar todas las peliculas // Todos los recursos que sean MOVIES se identifica con /movies
app.get("/movies", (req,res) => {

  res.header("Access-Control-Allow-origin")
  //filtrar
  const {genre} = req.query
  if (genre){
    const filteredMovies = movies.filter(
    movie => movie.genre.includes(genre))
  return res.json(filteredMovies)
    }
  res.json(movies);
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})


app.post("/movies", (req,res)=>{
  const movieSchema = z.object({
    title: z.string({invalid_type_error: "no es un string"}),
    genre: z.array(z.string()),
    year: z.number().int().positive(),
    duration: z.number().int().positive(),
    director: z.string(),
    poster : z.string.url()
    
  })

  const{
    title,
    genre,
    year,
    director,
    duration, 
    rate,
    poster
  }= req.body
  const newMovie={
    id:crypto.randomUUID(),//uuid => indenfiticadri unico universal
    title,
    genre,
    year,
    duration,
    director,
    rate: rate ?? 0,
    poster
  }
  movies.push(newMovie)

  res.status(201).json(newMovie)//actualazcoon chahe del clinte
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})


const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})

 