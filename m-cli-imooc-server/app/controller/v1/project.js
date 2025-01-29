const { Controller } = require("egg");

class ProjectController extends Controller {
  async index() {
    const { ctx } = this;
    const res = await ctx.model.Project.find({});
    ctx.body = res;
  }
  async show() {
    const { ctx } = this;
    const id = ctx.params.id;
    const res = await ctx.model.Project.find({ value: id });

    if (res.length > 0) {
      ctx.body = res[0];
    } else {
      ctx.body = {};
    }
  }
  async create() {
    this.ctx.body = "create";
    this.ctx.model.Project.create({
      // name: "vue3项目模板2",
      // npmName: "@mkeke-imooc/template-vue32",
      // value: "template-vue32",
      // version: "1.0.2",
    });
  }
  async update() {}
  async destroy() {}
}

module.exports = ProjectController;
