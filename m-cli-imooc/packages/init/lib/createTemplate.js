import { homedir } from "node:os";
import { log, makeList, makeInput, getLatestVersion } from "@mkeke-imooc/utils";
import path from "node:path";

const ADD_TYPE_PAGE = "page";
const ADD_TYPE_PROJECT = "project";

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
];

const ADD_TYPE = [
  {
    name: "项目",
    value: ADD_TYPE_PROJECT,
  },
  {
    name: "页面",
    value: ADD_TYPE_PAGE,
  },
];

const TEMP_HOME = ".mkeke-imooc-cli";

function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    message: "请选择初始化类型",
    defaultValue: ADD_TYPE_PROJECT,
  });
}
function getAddName() {
  return makeInput({
    message: "请输入项目名称",
    defaultValue: "project-name",
  });
}

function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择初始化模板",
    defaultValue: ADD_TEMPLATE[0],
  });
}

function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

export default async function createTemplate(name, opts) {
  const { type, template } = opts;
  // 获取创建类型
  let addType;
  // 获取创建模板
  let addTemplate;
  // 获取创建名称
  let addName;
  if (type) {
    addType = type;
  } else {
    addType = await getAddType();
  }
  log.verbose("addType", addType);
  if (addType === ADD_TYPE_PROJECT) {
    // 创建项目
    log.info("创建项目");
    if (name) {
      addName = name;
    } else {
      addName = await getAddName();
    }
    log.verbose("addName", addName);
    if (template) {
      addTemplate = template;
    } else {
      addTemplate = await getAddTemplate();
    }
    log.verbose("addTemplate", addTemplate);
    const selectedTemplate = ADD_TEMPLATE.find(
      (item) => item.value === addTemplate
    );
    if (!selectedTemplate) {
      throw new Error(`项目模板 ${addTemplate} 不存在`);
    }
    log.verbose("selectedTemplate", selectedTemplate);
    // 获取最新版本号
    const latestVersion = await getLatestVersion(selectedTemplate.npmName);
    log.verbose("latestVersion", latestVersion);
    selectedTemplate.version = latestVersion;
    const targetPath = makeTargetPath();
    return {
      type: addType,
      name: addName,
      template: selectedTemplate,
      targetPath,
    };
  } else if (addType === ADD_TYPE_PAGE) {
    // 创建页面
    log.info("创建页面");
  } else {
    throw new Error(`类型 ${addType} 不支持`);
  }
}
