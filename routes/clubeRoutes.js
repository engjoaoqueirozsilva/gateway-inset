// routes/clubeRoutes.js
import { generateRoutes } from "./base/baseRoute.js";
import  ClubeService  from '../services/ClubeService.js';

const clubeService = new ClubeService();
export default generateRoutes(clubeService);
