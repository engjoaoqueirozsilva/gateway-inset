import express from "express";
import PlanoService from "../services/PlanoService.js";
import { generateRoutes } from "./base/baseRoute.js";

const router = express.Router();
const planoService = new PlanoService();

export default generateRoutes(planoService, {
  populate: ["modalidade", "participantes.id"]
});
