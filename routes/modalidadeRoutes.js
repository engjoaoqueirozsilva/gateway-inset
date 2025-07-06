import express from 'express';
import { Modalidade } from '../models/ModalidadeModel.js';
import { BaseService } from '../services/base/BaseService.js';
import { generateRoutes } from "./BaseRoutes.js";

const modalidadeService = new BaseService(Modalidade);
export default generateRoutes(modalidadeService);