import { log, makeList } from "@mkeke-imooc/utils";
import fse from "fs-extra";
import path from "node:path";
import ora from "ora";
import { pathExistsSync } from "path-exists";
import ejs from "ejs";
import glob from "glob";
import url from "url"; // 引入 url 模块

function getCacheFilePath(targetPath, template) {
  const filePath = path.resolve(
    targetPath,
    "node_modules",
    template.npmName,
    "template"
  );
  return fileUrl(filePath);
}

function getPluginFilePath(targetPath, template) {
  const filePath = path.resolve(
    targetPath,
    "node_modules",
    template.npmName,
    "plugins",
    "index.js"
  );
  return fileUrl(filePath);
}

function fileUrl(filePath) {
  return url.pathToFileURL(filePath).href;
}

function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(url.fileURLToPath(originFile));
  const spinner = ora("正在安装模板...").start();
  log.verbose("copyFile", originFile, installDir);
  fileList.forEach((file) => {
    fse.copySync(
      path.join(url.fileURLToPath(originFile), file),
      path.join(installDir, file)
    );
  });
  spinner.stop();
  log.success("安装模板成功");
}

async function ejsRender(targetPath, installDir, name, template) {
  const { ignore } = template;
  const pluginPath = getPluginFilePath(targetPath, template);

  let mode = "default";
  if (pathExistsSync(url.fileURLToPath(pluginPath))) {
    const pluginRes = await (await import(pluginPath)).default({ makeList });
    mode = pluginRes.mode;
  }

  const ejsData = {
    data: { name, mode },
  };

  glob(
    "**",
    {
      cwd: installDir,
      nodir: true,
      ignore: [...ignore, "**/node_modules/**"],
    },
    (err, files) => {
      files.forEach((file) => {
        const filePath = path.join(installDir, file);
        ejs.renderFile(filePath, ejsData, (err, result) => {
          if (err) {
            log.error(err);
          } else {
            fse.writeFileSync(filePath, result);
          }
        });
      });
    }
  );
}

export default async function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, name, template } = selectedTemplate;
  const rootDir = process.cwd();
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`当前目录下已存在 ${installDir} 文件夹`);
      return;
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }
  copyFile(targetPath, template, installDir);
  await ejsRender(targetPath, installDir, name, template);
}
