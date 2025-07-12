import Clube from "../models/ClubeModel.js";
import { BaseService } from "./base/BaseService.js";

export default class ClubeService extends BaseService {
  constructor() {
    super(Clube);
  }
}