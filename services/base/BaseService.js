export class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  findAll() {
    return this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }
}