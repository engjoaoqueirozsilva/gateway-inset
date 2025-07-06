import  TreinoService  from '../services/TreinoService.js';
import { generateRoutes } from "./base/baseRoute.js";

const treinoService = new TreinoService();
export default generateRoutes(treinoService);
