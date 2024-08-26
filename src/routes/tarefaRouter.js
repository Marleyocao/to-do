import { Router } from "express";
import {getALL} from "../controllers/tarefaController.js"
const router = Router()

router.get("/", getALL)


export default router