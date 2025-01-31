import { GitServer } from "./GitServer.js";
import axios from "axios";

const BASE_URL = "https://gitee.com/api/v5";

class Gitee extends GitServer {
  constructor() {
    super();
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    });

    this.service.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  get(url, params, headers) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: "get",
      headers,
    });
  }

  post(url, params, headers) {
    return this.service({
      url,
      data,
      params: {
        access_token: this.token,
      },
      method: "post",
      headers,
    });
  }

  // 搜索会超时
  searchRepositories(params) {
    return this.get("/search/repositories", params);
  }

  // example: https://gitee.com/api/v5/repos/zhijiantianya/ruoyi-vue-pro/tags
  getTags(fullName) {
    return this.get(`/repos/${fullName}/tags`);
  }

  getRepoUrl(fullName) {
    // https://gitee.com/imooc-project/commit-test.git
    return `https://gitee.com/${fullName}.git`;
  }
}

export default Gitee;
