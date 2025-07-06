// routes/atletaRoutes.js
import { AtletaService } from "../services/AtletaService.js";
import { generateRoutes } from "./BaseRoutes.js";

const atletaService = new AtletaService();
export default generateRoutes(atletaService, { populate: ["modalidade"] });
