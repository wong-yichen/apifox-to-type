import { Empty, Layout, Tag, Tree } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getSchemas,
  getUserProjectDetail,
  getUserProjectDetailTree,
} from "../../client-api";
import HeaderNaviBar from "../../components/HeaderNaviBar";
import MarkdocView from "../../components/MarkDocView";

const { DirectoryTree } = Tree;

const { Header, Footer, Sider, Content } = Layout;

function schemaTypeConvert(type: any) {
  const convertMap = new Map([
    ["integer", "number"],
    ["text", "string"],
  ]);
  return convertMap.get(type) || type;
}

function parseResponse(responses: any, schemasMap: Map<string, any>) {
  if (!responses) return "";
  const prefix = "```ts\n";
  let result = "";
  if (Array.isArray(responses)) {
    responses.forEach((item) => {
      const { jsonSchema, name } = item;
      // console.log("jsonSchema", jsonSchema);
      result += parseJsonSchema(jsonSchema, schemasMap);
    });
  }
  if (result && result !== "{\n}\n") {
    return prefix + result + "```\n";
  } else {
    return "";
  }
}

function parseBodyParam(requestBody: any, schemasMap: Map<string, any>) {
  if (!requestBody) return "";
  const prefix = "```ts\n";
  let result = "";
  const { type, jsonSchema } = requestBody;
  if (jsonSchema) {
    result += parseJsonSchema(jsonSchema, schemasMap);
  }
  if (result && result !== "{\n}\n") {
    return prefix + result + "```\n";
  } else {
    return "";
  }
}

function parseQueryParam(arr = []) {
  if (arr.length === 0) return "";
  const prefix = "```ts\n";
  let result = "";
  result += "{\n";
  arr.forEach((item: any) => {
    if (item.description) {
      result += `  // ${item.description}\n`;
    }
    if (item.name) {
      result += `  ${item.name}${item.required ? "" : "?"}:${
        schemaTypeConvert(item.type) || "string"
      };\n`;
    }
  });
  result += "}\n";
  if (result && result !== "{\n}\n") {
    return prefix + result + "```\n";
  } else {
    return "";
  }
}

function parseJsonSchema(schema: any, schemasMap: Map<string, any>) {
  let level = 1;
  if (!schema || typeof schema !== "object") return "No JSON schema";
  let result = "{\n";

  function getTabWidth(level = 0, multiply = 4) {
    const l = level * multiply;
    let result = "";
    for (let i = 0; i < l; i++) {
      result += " ";
    }
    return result;
  }

  function parse(schema: any, level = 1) {
    const { type, properties, required } = schema;
    if (type === "object") {
      if (properties) {
        for (let key in properties) {
          const current = properties[key];
          if (current["x-tmp-pending-properties"]) {
            continue;
          }
          const { title, description, type } = current;
          const tabWidth = getTabWidth(level);
          const requiredMark = required && required.includes(key) ? "" : "?";
          let okType = "";
          if (Array.isArray(type)) {
            const types = Array.from(
              new Set(
                type.map((i) => schemaTypeConvert(i)) as string[]
              ).values()
            );
            okType = types.map((i) => schemaTypeConvert(i)).join(` | `) + ";\n";
          } else if (type === "object") {
            okType = "{\n";
          } else if (type === "array") {
            okType = "[{\n";
          } else if (current.$ref) {
            okType = "{\n";
          } else {
            okType = schemaTypeConvert(type) + ";\n";
          }
          if (title || description) {
            result += `${tabWidth}// ${title ? title : ""}${
              description ? description : ""
            }\n`;
          }
          result += `${tabWidth}${key}${requiredMark}:${okType}`;
          if (current.type === "object") {
            parse(current, level + 1);
            result += getTabWidth(level) + "}\n";
          } else if (current.type === "array") {
            const refStrId = current.items?.$ref || "";
            if (current.items && refStrId) {
              const id = refStrId.replace("#/definitions/", "");
              const refSchema = schemasMap.get(id);
              if (refSchema) {
                parse(refSchema?.jsonSchema, level + 1);
                console.log("refSchema:", refSchema);
              }
            } else {
              parse(current.items, level + 1);
            }
            result += getTabWidth(level) + "}]\n";
          } else if (current.$ref) {
            const refStrId = current.$ref || "";
            const id = refStrId.replace("#/definitions/", "");
            const refSchema = schemasMap.get(id);
            if (refSchema) {
              parse(refSchema?.jsonSchema, level + 1);
              console.log("refSchema:", refSchema);
            }
            result += getTabWidth(level) + "}\n";
          }
        }
      }
    }
  }
  parse(schema);
  result += "}\n";
  return result;
}

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const [treeData, setTreeData] = useState([]);
  const [apiDetailData, setApiDetailData] = useState([]);
  const [hydratedTreeData, setHydratedTreeData] = useState<any[]>([]);
  const [currentApiNode, setCurrentApiNode] = useState<any>(null);
  const [schemasMap, setSchemasMap] = useState<null | Map<string, any>>(null);
  const { id: projectId } = router.query;

  useEffect(() => {
    if (projectId) {
      queryProjectApiDetail(projectId as string);
      queryProjectApiTree(projectId as string);
      queryProjectSchemas(projectId as string);
    }
  }, [projectId]);

  async function queryProjectSchemas(id: string) {
    const res = await getSchemas(id);
    if (res.success) {
      const map = new Map();
      if (Array.isArray(res.data)) {
        res.data.forEach((item: any) => {
          map.set(String(item.id), item);
        });
      }
      setSchemasMap(map);
    }
  }

  async function queryProjectApiTree(id: string) {
    const res = await getUserProjectDetailTree(id);
    if (res.success) {
      setTreeData(res.data);
    }
  }

  async function queryProjectApiDetail(id: string) {
    const res = await getUserProjectDetail(id);
    if (res.success) {
      setApiDetailData(res.data);
    }
  }

  useEffect(() => {
    /**
     * 当apiDetailData，treeData，schemasMap都有值时，才进行hydrate
     *  将数据进行整合，重新构建树形结构数据
     * */
    if (apiDetailData.length > 0 && treeData.length > 0) {
      const hydratedTreeData = hydrateTreeData(apiDetailData, treeData);
      setHydratedTreeData(hydratedTreeData);
    }
  }, [apiDetailData, treeData]);

  function hydrateTreeData(detailData: any[], treeData: any[]) {
    const apiDetailMap = new Map();
    detailData.forEach((item) => {
      apiDetailMap.set(item.id, item);
    });

    function traverseNode(tree: any[]) {
      const result = [] as any[];
      if (!Array.isArray(tree)) {
        return result;
      }
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i] as any;
        if (!node) return result;
        // 如果不是api示例，则检查是否有详情数据，如果有，则添加到结果中
        if (node.type !== "apiCase") {
          // 如果是api详情，则标记为叶子节点
          if (node.type === "apiDetail") {
            node.isLeaf = true;
          }
          const id = node?.api?.id;
          if (id) {
            const detail = apiDetailMap.get(id);
            // 如果有详情数据，则添加到结果中
            if (detail) {
              node.detail = detail;
            } else {
              // 如果没有详情数据，则打印警告信息
              console.warn("api detail not found id:" + id);
            }
          } else {
            node.detail = null;
          }
          if (node.children) {
            node.children = traverseNode(node.children);
          }
          result.push(node);
        }
      }
      return result;
    }

    return traverseNode(treeData);
  }

  const [apiInfo, setApiInfo] = useState<any>({});

  function handleTreeSelect(selectedKeys: any[], info: any) {
    const nodeType = info.node.type;
    if (nodeType === "apiDetail") {
      const { parameters, requestBody, responses } = info.node?.detail;
      setApiInfo({ parameters, requestBody, responses });
      setCurrentApiNode(info.node);
      console.log("api-detail:", info.node);
    }
  }

  useEffect(() => {
    if (schemasMap) {
      parseApiInfo(apiInfo, schemasMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiInfo, schemasMap]);

  const [queryStr, setQueryStr] = useState("");
  const [bodyStr, setBodyStr] = useState("");
  const [responseStr, setResponseStr] = useState("");

  function parseApiInfo(apiInfo: any, schemasMap: Map<string, any>) {
    const { parameters, requestBody, responses } = apiInfo;
    if (!schemasMap) return;
    // 解析请求参数
    if (parameters) {
      const query = parameters.query || [];
      const queryStr = parseQueryParam(query);
      const bodyStr = parseBodyParam(requestBody, schemasMap);
      const responseStr = parseResponse(responses, schemasMap);
      setQueryStr(queryStr);
      setBodyStr(bodyStr);
      setResponseStr(responseStr);
    }
  }

  return (
    <div className="project-detail-page w-full h-screen flex flex-col">
      <div style={{ height: "60px", backgroundColor: "#fff" }}>
        <HeaderNaviBar></HeaderNaviBar>
      </div>
      <div
        className="flex h-full"
        style={{
          height: "calc(100% - 60px)",
        }}
      >
        <div
          className="h-full overflow-y-auto flex-shrink-0"
          style={{
            backgroundColor: "#fff",
            overflow: "auto",
            padding: "15px",
            minWidth: "200px",
            borderRight: "1px solid #e8e8e8",
            transition: "all 0.5s ease",
          }}
        >
          <DirectoryTree
            multiple
            onSelect={handleTreeSelect}
            fieldNames={{
              title: "name",
            }}
            treeData={hydratedTreeData}
          />
        </div>
        <div
          className="w-full h-full overflow-auto"
          style={{
            overflow: "auto",
            padding: "15px",
            backgroundColor: "#F1F3F4",
          }}
        >
          {currentApiNode?.detail ? (
            <div className="api-info">
              <div className="api-info-title font-bold text-[16px] text-gray-600 pb-[15px]">
                <span className="pr-[10px]">{currentApiNode?.name}</span>
                <span className="pr-[10px]">
                  <MethodTag method={currentApiNode?.api?.method}></MethodTag>
                </span>
                <span className="pr-[10px] font-normal">
                  {currentApiNode?.api?.path}
                </span>
              </div>
              <div className="parameters pb-[20px]">
                <h1 className="text-gray-600">QueryParam</h1>
                <div className="break-all">
                  {queryStr ? (
                    <MarkdocView source={queryStr}></MarkdocView>
                  ) : (
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      imageStyle={{
                        height: 60,
                      }}
                      description={null}
                    ></Empty>
                  )}
                </div>
              </div>
              <div className="requestBody pb-[20px]">
                <h1 className="text-gray-600">BodyParam</h1>
                <div className="break-all">
                  {bodyStr ? (
                    <MarkdocView source={bodyStr}></MarkdocView>
                  ) : (
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      imageStyle={{
                        height: 60,
                      }}
                      description={null}
                    ></Empty>
                  )}
                </div>
              </div>
              <div className="responses pb-[20px]">
                <h1 className="text-gray-600">Responses</h1>
                <div className="break-all">
                  {responseStr ? (
                    <MarkdocView source={responseStr}></MarkdocView>
                  ) : (
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      imageStyle={{
                        height: 60,
                      }}
                      description={null}
                    ></Empty>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{
                height: "200px",
              }}
              description={<span>还未选择API，请点击左侧目录树选择API</span>}
            ></Empty>
          )}
        </div>
      </div>
    </div>
  );
};

const MethodTag = (props: { method?: string }) => {
  const method = props.method || "";
  const colorsMap = new Map([
    ["get", "#52c41a"],
    ["post", "#faad14"],
    ["put", "#1890ff"],
    ["delete", "#f5222d"],
  ]);
  const color = colorsMap.get(method) || "#1890ff";
  return <Tag color={color}>{method.toUpperCase()}</Tag>;
};

export default ProjectDetailPage;
