import Image from "next/image";
import Link from "next/link";

type ProjectItemProps = {
  name: string;
  description: string;
  id: number;
  icon: string;
};

function ProjectItem(props: ProjectItemProps) {
  const { name, description, id, icon } = props;
  return (
    <div className="cursor-pointer rounded-md bg-slate-50 hover:shadow shadow-sm project-item ">
      <Link href={`/projects/${id}`}>
        <div className="flex  py-[10px] px-[10px] items-center">
          <div className="icon-area rounded-md overflow-hidden w-[40px] h-[40px] relative flex-shrink-0">
            <Image
              className="absolute inset-0 h-full w-full"
              layout="fill"
              objectFit="cover"
              src={icon}
              alt="icon"
            />
          </div>
          <div className="name-desc pl-2 w-full truncate text-stone-700">{name}</div>
        </div>
      </Link>
    </div>
  );
}

export default ProjectItem;