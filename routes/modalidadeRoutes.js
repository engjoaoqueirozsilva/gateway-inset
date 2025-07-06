import  ModalidadeService  from '../services/ModalidadeService.js';
import { generateRoutes } from "./base/baseRoute.js";

const modalidadeService = new ModalidadeService();
export default generateRoutes(modalidadeService);