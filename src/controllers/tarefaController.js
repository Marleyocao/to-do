import { response } from "express"
import Tarefa from "../models/tarefaModel.js"
import {z} from "zod"
import formatZodError from "../helpers/formatZodError.js"

//Validações com ZOD
const createSchema = z.object({
    tarefa: z.string().min(3,{message:"A tarefa tem que ter pelo menos 3 caracteres"}).trim().transform((txt)=>txt.toLowerCase()),
    descricao:z.string().min(5, {message:"A Descrição deve ter pelo menos 5 caracteres"}),
})

const getSchema = z.object({id:z.string().uuid({message:'Id da tarefa está inválido'})})

const buscarTarefaPorSituacaoShema = z.object({
    situacao: z.enum(["pendente", "concluida"])
}) 

const updateStatusTarefaSchema = z.object({
    tarefa: z.string().min(3,{message:"A tarefa deve ter pelo menos 3 caracteres"}),
    descricao: z.string().min(3,{message:"A Descrição deve ter pelo menos 5 caracteres"}),
    situacao:  z.enum(["pendente", "concluida"])
})

//tarefas?page=2&limit=10
export const getALL = async (req,res)=>{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    try {
        const tarefas = await Tarefa.findAndCountAll({
            limit,
            offset,
        })
0
        const totalPaginas = Math.ceil(tarefas.count / limit)
        response.status(200).json({totalTarefas: tarefas.count,totalPaginas,
        paginaAtual: page,
        itemsPorPagina: limit,
        proximaPagina: totalPaginas = 0 ? null : `http://localhost:3333/tarefas?page=${page + 1}`,
        tarefas: tarefas.rows
        })
    } catch (error) {
        response.status(500).json({message:"Erro ao buscar tarefas"})
    }
}

//Precisa de validação - ok
export const create = async(req,res) => {

    //implementar a validação
    const bodyValidation = createSchema.safeParse(req.body)
    //console.log(bodyValidation)
    if(!bodyValidation.success){
        res.status(400).json({
            message:"Os dados recebidos do corpo da requsição são invalidos",
        datalhes: formatZodError(bodyValidation.error)
    })
    return
    }
    return

    const {tarefa, descricao} = req.body
    const status = "pendente"

    if(!tarefa){
        res.status(400).json({err:"a tarefa é obrigatorio"})
    }
    if(!descricao){
        res.status(400).json({err:"a descrição é obrigatorio"})
    }

    const novaTarefa = {
        tarefa,
        descricao,
        status
    }

try {
    await Tarefa.create(novaTarefa)
    response.status(201).json({message:"Tarefa Cadastrada"})
} catch (error) {
    console.log(error)
    response.status(201).json({message:"Erro ao cadastrar tarefa"})
}

}

//Precisa de validação
export const getTarefa = async(req,res) => {

    const paramValidator = getSchema.safeParse(req.params)
    if(!paramValidator.success){
        res.status(400).json({
            message:"Número de identificação está inválido",
            detalhes: formatZodError(paramValidator.error)
        })
    }

    const {id} = req.params

    try {
        //const tarefa = await Tarefa.findByPk(id) OBJETO
        const tarefa = await Tarefa.findOne({where: {id}})
        if(!tarefa){
            response.status(404).json({menssage:"tarefa não encontrada"})
            return
        }
        response.status(200).json(tarefa)
    } catch (error) {
        response.status(500).json({message: "erro ao buscar tarefa"})
    }
}

//Precisa de validação
export const updateTarefa = async (req,res) => {

    const paramValidator = getSchema.safeParse(req.params)
    if(!paramValidator.success){
        res.status(400).json({
            message:"Número de identificação está inválido",
            detalhes: formatZodError(paramValidator.error)
        })
    }

    const updateValidator = updateStatusTarefaSchema.safeParse(req.body)
    if(!updateValidator.success){
        res.status(400).json({
            message:"Dadospara atualização estão incorretos",
            details: formatZodError(updateValidator.error)
        })
        return
    }

    const {id} = req.params
    const {tarefa,descricao,status} = req.body

    const tarefaAtualizada = {
        tarefa,
        descricao,
        status
    }

    try {
    const [linhasAfetadas] = await Tarefa.update(tarefaAtualizada,{where:{ id }})

    if(linhasAfetadas <= 0){
        response.status(404).json({message:"tarefa não encontrada"})
        return
    }
        response.status(200).json({message:"Tarefa Atualizada"})
    } catch (error) {
        response.status(500).json({message:"Erro ao atualizar Atualizada"})
    }
}

//Precisa de validação
export const updateStatusTarefa = async (req,res) =>{

    const updateValidator = updateStatusTarefaSchema.safeParse(req.body)
    if(!updateValidator.success){
        res.status(400).json({
            message:"Dadospara atualização estão incorretos",
            details: formatZodError(updateValidator.error)
        })
        return
    }

    const {id} = req.params

    try {
        const tarefa = await Tarefa.findOne({raw: true ,where:{id}})
        if (tarefa === null){
            res.status(404).json({message:"tarefa não encontrada"})
            return
        }

        if(tarefa.status === "pedente"){
            await Tarefa.update({status:"concluida"},{wherw:{id}})
        }else if(tarefa.status === "concluida"){
            await Tarefa.update({status:"pendente"},{wherw:{id}})
        }

        //novaConsulta
        const raretaAtualizada = await Tarefa.findOne({raw: true ,where:{id}})
        res.status(200).json(tarefaAtualizada)
        
    } catch (error) {
        console.log(tarefa.status)
        console.log(error)
        res.status(500).json({err:"Erro ao buscar tarefa"})
    }
}

// validação

export const buscarTarefaPorSituacao = async (req,res)=>{

    const situacaoValidation = buscarTarefaPorSituacao.safeParse(req.params)
    if(!situacaoValidation.success){
        res.status(400).json({message:"Situação invalida", details: formatZodError(situacaoValidation.error)})
        return
    }
    
    const {situacao}= req.params
    if(situacao !== "pendente"  && situacao !== "concluida"){
        res.status(400).json({message:"Situação invalido. Use 'pendente' ou 'concluida'"})
    }

    try {
        const tarefas = await Tarefa.findAll({
            where: {status:situacao},
            raw: true,
        })

        res.status(200).json(tarefas)
    } catch (error) {
        res.status(200).json({err: "erro ao buscar situação"})
    }
}