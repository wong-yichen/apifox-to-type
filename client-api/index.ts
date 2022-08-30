import request from "../utils/request";

type LoginRes = {
  data: {
    accessToken: string;
    authority: string;
    userId: number;
  };
  success: boolean;
};
export function Login(account: string, password: string): Promise<LoginRes> {
  return request.post("/login", { account, password }, { needToken: false });
}

export function getUserProjects() {
  return request.get("/user-projects");
}


export function getUserProjectDetail(id: string) {
  return request.get('/api-details',{},{
    headers:{
      'X-Project-Id':id
    }
  });
}

export function getUserProjectDetailTree(id: string) {
  return request.get('/api-tree-list',{},{
    headers:{
      'X-Project-Id':id,
    }
  });
}

export function getSchemas(id: string) {
  return request.get('/api-schemas',{},{
    headers:{
      'X-Project-Id':id
    }
  });
}