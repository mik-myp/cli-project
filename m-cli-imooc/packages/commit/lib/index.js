import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import SimpleGit from "simple-git";
import semver, { inc } from "semver";
import Command from "@mkeke-imooc/command";
import {
  log,
  initGitServer,
  initGitType,
  clearCache,
  createRemoteRepo,
  makeInput,
  makeList,
} from "@mkeke-imooc/utils";

/**
 * CommitCommand 类用于处理项目的提交和发布流程。
 */
class CommitCommand extends Command {
  /**
   * 获取命令名称。
   * @returns {string} 命令名称 "commit"
   */
  get command() {
    return "commit";
  }

  /**
   * 获取命令描述。
   * @returns {string} 命令描述 "commit project"
   */
  get description() {
    return "commit project";
  }

  /**
   * 获取命令选项。
   * @returns {Array} 命令选项数组
   */
  get options() {
    return [
      ["-c, --clear", "清空缓存", false],
      ["-p, --publish", "发布", false],
    ];
  }

  /**
   * 执行命令的主要逻辑。
   * @param {Object} params - 参数对象，包含 clear 和 publish 属性
   */
  async action([{ clear, publish }]) {
    log.verbose("params", clear, publish);
    if (clear) {
      clearCache();
    }
    await this.createRemoteRepo();
    await this.initLocal();
    await this.commit();
    if (publish) {
      await this.publish();
    }
  }

  // 阶段1：创建远程仓库
  /**
   * 创建远程仓库并初始化 .gitignore 文件。
   */
  async createRemoteRepo() {
    // 1. 实例化Git对象
    this.gitAPI = await initGitServer();
    // 2. 仓库类型选择
    await initGitType(this.gitAPI);
    // 3. 创建远程仓库
    // 获取项目名称
    const dir = process.cwd();
    const pkg = fse.readJsonSync(path.resolve(dir, "package.json"));
    this.name = pkg.name;
    this.version = pkg.version || "1.0.0";
    await createRemoteRepo(this.gitAPI, this.name);
    // 4. 生成.gitignore
    const gitIgnorePath = path.resolve(dir, ".gitignore");
    if (!fs.existsSync(gitIgnorePath)) {
      log.info(".gitignore不存在，开始创建");
      fs.writeFileSync(
        gitIgnorePath,
        `.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
      );
      log.success(".gitignore创建成功");
    }
  }

  // 阶段2：git本地初始化
  /**
   * 初始化本地 Git 仓库并设置远程仓库。
   */
  async initLocal() {
    // 生成git remote地址
    const remoteUrl = this.gitAPI.getRepoUrl(
      `${this.gitAPI.login}/${this.name}`
    );
    // 初始化git对象
    this.git = SimpleGit(process.cwd());
    // 判断当前项目是否进行git初始化
    const gitDir = path.resolve(process.cwd(), ".git");
    if (!fs.existsSync(gitDir)) {
      // 实现git初始化
      await this.git.init();
      log.success("完成git初始化");
    }
    // 获取所有的remotes
    const remotes = await this.git.getRemotes();
    if (!remotes.find((remote) => remote.name === "origin")) {
      this.git.addRemote("origin", remoteUrl);
      log.success("添加git remote", remoteUrl);
      // 检查未提交代码
      await this.checkNotCommitted();
      // 检查是否存在远程master分支
      const tags = await this.git.listRemote(["--refs"]);
      log.verbose("listRemote", tags);
      if (tags.indexOf("refs/heads/master") >= 0) {
        await this.pullRemoteRepo("master", {
          "--allow-unrelated-histories": null,
        });
      } else {
        // 推送代码到远程master分支
        await this.pushRemoteRepo("master");
      }
    }
  }

  // 阶段3：代码自动化提交
  /**
   * 自动化提交代码到指定分支。
   */
  async commit() {
    await this.getCorrectVersion();
    await this.checkStash();
    await this.checkConflicted();
    await this.checkNotCommitted();
    await this.checkoutBranch(this.branch);
    await this.pullRemoteMasterAndBranch();
    await this.pushRemoteRepo(this.branch);
  }

  // 阶段4：代码发布
  /**
   * 发布代码到 master 分支并清理分支。
   */
  async publish() {
    await this.checkTag();
    await this.checkoutBranch("master");
    await this.mergeBranchToMaster();
    await this.pushRemoteRepo("master");
    await this.deleteLocalBranch();
    await this.deleteRemoteBranch();
  }

  /**
   * 删除本地分支。
   */
  async deleteLocalBranch() {
    log.info("开始删除本地分支", this.branch);
    await this.git.deleteLocalBranch(this.branch);
    log.success("删除本地分支成功", this.branch);
  }

  /**
   * 删除远程分支。
   */
  async deleteRemoteBranch() {
    log.info("开始删除远程分支", this.branch);
    await this.git.push(["origin", "--delete", this.branch]);
    log.success("删除远程分支成功", this.branch);
  }

  /**
   * 合并分支到 master。
   */
  async mergeBranchToMaster() {
    log.info("开始合并代码", `[${this.branch}] -> [master]`);
    await this.git.mergeFromTo(this.branch, "master");
    log.success("代码合并成功", `[${this.branch}] -> [master]`);
  }

  /**
   * 检查并处理 tag。
   */
  async checkTag() {
    log.info("获取远程 tag 列表");
    const tag = `release/${this.version}`;
    const tagList = await this.getRemoteBranchList("release");
    if (tagList.includes(this.version)) {
      log.info("远程 tag 已存在", tag);
      await this.git.push(["origin", `:refs/tags/${tag}`]);
      log.success("远程 tag 已删除", tag);
    }
    const localTagList = await this.git.tags();
    if (localTagList.all.includes(tag)) {
      log.info("本地 tag 已存在", tag);
      await this.git.tag(["-d", tag]);
      log.success("本地 tag 已删除", tag);
    }
    await this.git.addTag(tag);
    log.success("本地 tag 创建成功", tag);
    await this.git.pushTags("origin");
    log.success("远程 tag 推送成功", tag);
  }

  /**
   * 合并远程 master 和当前分支。
   */
  async pullRemoteMasterAndBranch() {
    log.info(`合并 [master] -> [${this.branch}]`);
    await this.pullRemoteRepo("master");
    log.success("合并远程 [master] 分支成功");
    log.info("检查远程分支");
    const remoteBranchList = await this.getRemoteBranchList();
    if (remoteBranchList.indexOf(this.version) >= 0) {
      log.info(`合并 [${this.branch}] -> [${this.branch}]`);
      await this.pullRemoteRepo(this.branch);
      log.success(`合并远程 [${this.branch}] 分支成功`);
      await this.checkConflicted();
    } else {
      log.success(`不存在远程分支 [${this.branch}]`);
    }
  }

  /**
   * 从远程拉取指定分支。
   * @param {string} branch - 分支名称，默认为 "master"
   * @param {Object} options - 拉取选项，默认为空对象
   */
  async pullRemoteRepo(branch = "master", options = {}) {
    // 拉取远程master分支，实现代码同步
    log.info(`同步远程 ${branch} 分支代码`);
    await this.git.pull("origin", branch, options).catch((err) => {
      log.error("git pull origin " + branch, err.message);
      if (err.message.indexOf("Couldn't find remote ref master") >= 0) {
        log.warn("获取远程[master]分支失败");
      }
      process.exit(0);
    });
  }

  /**
   * 切换到指定分支。
   * @param {string} branchName - 分支名称
   */
  async checkoutBranch(branchName) {
    const localBranchList = await this.git.branchLocal();
    if (localBranchList.all.indexOf(branchName) >= 0) {
      await this.git.checkout(branchName);
    } else {
      await this.git.checkoutLocalBranch(branchName);
    }
    log.success(`本地分支切换到${branchName}`);
  }

  /**
   * 检查代码冲突。
   */
  async checkConflicted() {
    log.info("代码冲突检查");
    const status = await this.git.status();
    if (status.conflicted.length > 0) {
      throw new Error("当前代码存在冲突，请手动处理合并后再试！");
    }
    log.success("代码冲突检查通过");
  }

  /**
   * 检查 stash 记录。
   */
  async checkStash() {
    log.info("检查 stash 记录");
    const stashList = await this.git.stashList();
    if (stashList.all.length > 0) {
      await this.git.stash(["pop"]);
      log.success("stash pop 成功");
    }
  }

  /**
   * 获取正确的版本号。
   */
  async getCorrectVersion() {
    log.info("获取代码分支");
    const remoteBranchList = await this.getRemoteBranchList("release");
    let releaseVersion = null;
    if (remoteBranchList && remoteBranchList.length > 0) {
      releaseVersion = remoteBranchList[0];
    }
    const devVersion = this.version;
    if (!releaseVersion) {
      this.branch = `dev/${devVersion}`;
    } else if (semver.gt(devVersion, releaseVersion)) {
      log.info(
        "当前版本号大于线上最新版本号",
        `${devVersion} > ${releaseVersion}`
      );
      this.branch = `dev/${devVersion}`;
    } else {
      log.info(
        "当前线上版本号大于本地版本号",
        `${releaseVersion} >= ${devVersion}`
      );
      const incType = await makeList({
        message: "自动升级版本，请选择升级版本类型",
        defaultValue: "patch",
        choices: [
          {
            name: `小版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "patch"
            )})`,
            value: "patch",
          },
          {
            name: `中版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "minor"
            )})`,
            value: "minor",
          },
          {
            name: `大版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "major"
            )})`,
            value: "major",
          },
        ],
      });
      const incVersion = semver.inc(releaseVersion, incType);
      this.branch = `dev/${incVersion}`;
      this.version = incVersion;
      this.syncVersionToPackageJson();
    }
    log.success(`代码分支获取成功 ${this.branch}`);
  }

  /**
   * 同步版本号到 package.json 文件。
   */
  syncVersionToPackageJson() {
    const dir = process.cwd();
    const pkgPath = path.resolve(dir, "package.json");
    const pkg = fse.readJsonSync(pkgPath);
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version;
      fse.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    }
  }

  /**
   * 获取远程分支列表。
   * @param {string} type - 分支类型，默认为空字符串
   * @returns {Promise<Array>} 远程分支列表
   */
  async getRemoteBranchList(type) {
    const remoteList = await this.git.listRemote(["--refs"]);
    let reg;
    if (type === "release") {
      // release/0.0.1
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g;
    } else {
      // dev/0.0.1
      reg = /.+?refs\/tags\/dev\/(\d+\.\d+\.\d+)/g;
    }
    return remoteList
      .split("\n")
      .map((remote) => {
        const match = reg.exec(remote);
        reg.lastIndex = 0;
        if (match && semver.valid(match[1])) {
          return match[1];
        }
      })
      .filter((_) => _)
      .sort((a, b) => {
        if (semver.lte(b, a)) {
          if (a === b) return 0;
          return -1;
        }
        return 1;
      });
  }

  /**
   * 检查未提交的更改并提交。
   */
  async checkNotCommitted() {
    const status = await this.git.status();
    if (
      status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0 ||
      status.renamed.length > 0
    ) {
      log.verbose("status", status);
      await this.git.add(status.not_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.modified);
      await this.git.add(status.renamed.map((item) => item.to)); // 获取renamed内容
      let message;
      while (!message) {
        message = await makeInput({
          message: "请输入 commit 信息: ",
        });
      }
      await this.git.commit(message);
      log.success("本地 commit 提交成功");
    }
  }

  /**
   * 推送代码到远程分支。
   * @param {string} branchName - 分支名称
   */
  async pushRemoteRepo(branchName) {
    log.info(`推送代码至远程 ${branchName} 分支`);
    await this.git.push("origin", branchName);
    log.success("推送代码成功");
  }
}

/**
 * 创建并返回一个新的 CommitCommand 实例。
 * @param {Object} instance - 实例对象
 * @returns {CommitCommand} 新的 CommitCommand 实例
 */
function Commit(instance) {
  return new CommitCommand(instance);
}

export default Commit;
