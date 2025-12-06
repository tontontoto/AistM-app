import React from "react";
import Image from "next/image";

export default function ProjectCard(project_title: {project_title: string}) {
    return (
        <div className="flex flex-row gap-2 items-center border border-gray-300 rounded-lg p-4 mt-4">
            <Image
                src="/projecticon.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
            ></Image>
            <p className="text-xl font-bold">{project_title.project_title}</p>
        </div>
    );
}
