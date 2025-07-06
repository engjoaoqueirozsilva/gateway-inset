import express from 'express';
import { Treino } from '../models/TreinoModel.js';
import { BaseService } from '../services/base/BaseService.js';
import { generateRoutes } from "./BaseRoutes.js";

const treinoService = new BaseService(Treino);
export default generateRoutes(treinoService);
