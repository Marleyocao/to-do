import { Router } from "express";
import {create, getALL, getTarefa, updateTarefa,updateStatusTarefa, buscarTarefaPorSituacao} from "../controllers/tarefaController.js"

const router = Router()


router.post("/", create)
router.get("/", getALL)
router.get("/:id", getTarefa)
router.put("/:id", updateTarefa)
router.patch("/:id/status", updateStatusTarefa)
router.patch("/status/:situacao", buscarTarefaPorSituacao)
export default router



