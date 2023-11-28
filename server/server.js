import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import connect from './dataBase/conn.js'
import router from './routes/routes.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.disable('x-powered-By')


app.get('/', (req, res) => {
    res.status(201).json('Home GET Request')
})

app.use('/api', router)

connect().then(() => {
    try {
        app.listen(PORT, () => {
            console.log(`Server connected to http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log('connot connect to the server')
    }
}).catch(error => {
    console.log('Invalid DataBase connection...!')
})