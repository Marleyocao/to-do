import "dotenv/config"
import express from "express"
import cors from "cors"

//importar conexão do banco
import conn from "./config/conn.js"

//importação das rotas
import tarefaRouter from "./routes/tarefaRouter.js"

const PORT = process.env.PORT || 3333

const app = express()

//3 middlewares
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())


//conexão com o banco
conn.sync().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Servidor on http://localhost:${PORT}`)
    })
}).catch((error)=>{console.error(error)})

//Utilizar rotas
app.use("/tarefas", tarefaRouter)

app.use((req, res)=>{
    res.status(404).json({message: "Rota não encontrada"})
})
