const { Controller } = require("egg");

const ADD_TEMPLATE = [
  {
    name: "vue3项目模板",
    npmName: "@mkeke-imooc/template-vue3",
    value: "template-vue3",
    version: "1.0.0",
  },
  {
    name: "react项目模板",
    npmName: "@mkeke-imooc/template-react18",
    value: "template-react18",
    version: "1.0.0",
  },
  {
    name: "vue-element-admin项目模板",
    npmName: "@mkeke-imooc/template-vue-element-admin",
    value: "vue-element-admin",
    version: "1.0.0",
  },
];

class ProjectController extends Controller {
  async template() {
    const { ctx } = this;
    ctx.body = ADD_TEMPLATE;
  }
}

module.exports = ProjectController;
