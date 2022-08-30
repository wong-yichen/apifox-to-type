import { message, notification } from "antd";
import axios, { AxiosRequestConfig } from "axios";
import { delayAsync } from "../delayAsync";

const REQUEST_BASE_CONFIG = {
  baseURL: "/api",
  timeout: 30000,
};

interface RequestConfig extends AxiosRequestConfig {
  needToken?: boolean;
  ignoreErrors?: boolean;
}

export const baseRequest = axios.create(REQUEST_BASE_CONFIG);

export async function getHeaders(config: RequestConfig) {
  const headers = (config.headers ? config.headers : {}) as {
    Authorization?: string;
  } as any;
  headers["X-Client-Version"] = "2.1.28-alpha.3";
  headers["X-Client-Mode"] = "web";
  headers["referer"] = "https://www.apifox.cn/";
  headers["origin"] = "https://www.apifox.cn/";
  if (config.needToken) {
    const token = window.localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = token;
    } else {
      message.error("请先登录");
      await delayAsync(2);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Token is not found");
    }
  }
  return headers;
}

const myRequest = async function (
  method = "GET",
  url: string,
  data: any = {},
  config?: RequestConfig
) {
  config = {
    needToken: true,
    ignoreErrors: false,
    ...config,
  };
  let response = null as any;
  try {
    switch (method) {
      case "GET":
        response = await baseRequest.get(url, {
          ...config,
          params: data,
          headers: await getHeaders(config),
        });
        break;
      case "POST":
        response = await baseRequest.post(url, data, {
          ...config,
          headers: await getHeaders(config),
        });
        break;
      case "PUT":
        response = await baseRequest.put(url, data, {
          ...config,
          headers: await getHeaders(config),
        });
        break;
      case "DELETE":
        response = await baseRequest.delete(url, {
          ...config,
          headers: await getHeaders(config),
          data,
        });
        break;
    }
  } catch (e: any) {
    notification.open({
      message: e.message || "未知错误",
      type: "error",
    });
    return Promise.reject(e);
  }
  const { success, message, msg } = response.data;
  const msgStr = msg || message;
  if (!success) {
    notification.open({
      message: "发生错误",
      description: msgStr,
      type: "error",
    });
    return Promise.reject(msgStr);
  }
  return response.data;
};

function get(url: string, data?: any, config?: RequestConfig) {
  return myRequest("GET", url, data, config);
}

function post(url: string, data?: any, config?: RequestConfig) {
  return myRequest("POST", url, data, config);
}

function put(url: string, data?: any, config?: RequestConfig) {
  return myRequest("PUT", url, data, config);
}

function del(url: string, data?: any, config?: RequestConfig) {
  return myRequest("DELETE", url, data, config);
}

const request = { get, post, put, del };

export default request;
