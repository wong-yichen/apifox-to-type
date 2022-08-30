import { message } from "antd";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import { Login } from "../client-api";

const LoginPage: NextPage = () => {
  const router = useRouter();
  type FormDataType = {
    account: string;
    password: string;
  };
  const [formData, setFormData] = useReducer(
    (state: FormDataType, newState: Partial<FormDataType>) => ({
      ...state,
      ...newState,
    }),
    {
      account: "",
      password: "",
    }
  );

  useEffect(() => {
    const localUsrAccount = localStorage.getItem("usr-account");
    if (localUsrAccount) {
      const data = JSON.parse(localUsrAccount);
      setFormData(data);
    }
  }, []);

  const handleChangeFormData = (data:Partial<FormDataType>) => {
    const newFormData = {...formData, ...data};
    window.localStorage.setItem("usr-account", JSON.stringify(newFormData));
    setFormData(newFormData);
  }
  

  async function handleLogin() {
    console.log(formData);
    const { account, password } = formData;
    if (!account) {
      message.error("请输入账号");
      return;
    }
    if (!password) {
      message.error("请输入密码");
      return;
    }
    const res = await Login(account, password);
    if(res.success){
      const token = res.data.accessToken;
      if(token){
        window.localStorage.setItem("token", token);
        message.success("登录成功");
        router.push("/projects");
      }else{
        message.error("登录失败，Token为空");
      }
    }
  }

  return (
    <div
      className="login bg-gradient-to-br from-[#28b567] to-[#1a8085] w-full h-screen overflow-auto flex justify-center items-center px-[20px]"
      data-component="login"
    >
      <div className="center-box flex bg-[rgba(0,0,0,0.2)] flex-col items-center justify-center center-box w-full shadow-xl rounded-xl max-w-[800px] max-h-[550px] h-full min-w-[350px] min-h-[500px]">
        <h1 className="text-center py-[30px] text-white font-bold text-[26px] m-0">
          ApiFox To Type
        </h1>
        <p className="text-white">Welcome to login</p>
        <div className="w-full form flex flex-col items-center mt-[30px]">
          <div className="form-item grid grid-cols-12 mb-[30px]">
            <span className="text-gray-300 pr-[10px] text-[14px] form-item-label col-span-3 text-right flex items-center justify-end">
              账户：
            </span>
            <input
              value={formData.account}
              onChange={(e) => {
                handleChangeFormData({ account: e.target.value });
              }}
              placeholder="请输入账户"
              maxLength={30}
              className="h-[34px] placeholder-[#ccc] text-white duration-300 linear transition-colors focus:border-[#12e03e] bg-[rgba(0,0,0,0.2)] border-solid outline-none px-[10px] col-span-8 rounded border border-[#1da35a]"
            />
          </div>
          <div className="form-item grid grid-cols-12 mb-[30px]">
            <span className="text-gray-300 pr-[10px] text-[14px] form-item-label col-span-3 text-right flex items-center justify-end">
              密码：
            </span>
            <input
              value={formData.password}
              onChange={(e) => {
                handleChangeFormData({ password: e.target.value });
              }}
              placeholder="请输入密码"
              maxLength={30}
              type="password"
              className="h-[34px] placeholder-[#ccc] text-white duration-300 linear transition-colors focus:border-[#12e03e] bg-[rgba(0,0,0,0.2)] border-solid outline-none px-[10px] col-span-8 rounded border border-[#1da35a]"
            />
          </div>
          <div className="mt-[20px]">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-br active:shadow-none cursor-pointer active:from-[#0c8628]  active:to-[#3b799d] from-[#21a22a] to-[#3b9cd4] border-none text-[14px] login-btn py-[10px] px-[30px] rounded shadow-xl text-gray-200"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// const Card = styled.div`
//   width: 300px;
// `

export default LoginPage;
