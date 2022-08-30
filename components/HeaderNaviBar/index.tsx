import { Button } from "antd";
import Link from "next/link";
import { PropsWithChildren } from "react";

function HeaderNaviBar(
  props: PropsWithChildren & {
    style?: React.CSSProperties;
  }
) {
  return (
    <div
      style={props.style}
      className="header-navi-bar z-[999] bg-white shadow px-[25px] h-[60px] w-full fixed left-0 right-0 top-0 flex justify-between items-center"
    >
      <div className="header-title  text-[15px]">ApiFox for TypeScript Type</div>
      <div className="navi-links flex">
        <Link href={"/projects"}>
          <Button type="link">项目目录</Button>
        </Link>
        <Link href={"/"}>
          <Button type="link" danger>登陆页</Button>
        </Link>
      </div>
    </div>
  );
}

export default HeaderNaviBar;
