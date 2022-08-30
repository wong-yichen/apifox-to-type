import { Card } from "antd";
import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { getUserProjects } from "../../client-api";
import HeaderNaviBar from "../../components/HeaderNaviBar";
import ProjectItem from "../../components/ProjectItem";


const ProjectsPage: NextPage = () => {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    getProjects();
  }, []);

  async function getProjects() {
    const res = await getUserProjects();
    if (res.success) {
      setProjects(res.data);
    }
  }
  return (
    <div className="projects-page w-full pt-[70px] bg-gray-100 min-h-screen p-[40px]">
      <HeaderNaviBar></HeaderNaviBar>
      <div className="center-box-wrapper grid grid-cols-3 gap-4 max-w-[900px] m-auto w-full ">
        {projects.map((project: any) => (
          <ProjectItem key={project.id} {...project}></ProjectItem>
        ))}
      </div>
    </div>
  );
};


export default ProjectsPage;
