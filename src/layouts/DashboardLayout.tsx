import React, { type ReactNode } from "react";
import DashboardNav from "../components/DashboardNav";

interface DashboardLayoutProps {
  children: ReactNode;
  name?: string;
  showCourse?: boolean;
  showSettings?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  name,
  showCourse,
  showSettings,
}) => {
  return (
    <section className="pb-8">
      <DashboardNav showSettings={showSettings} />
      <section className="max-w-screen-2xl mx-auto pt-44 flex flex-col gap-16 px-4">
        <div className="flex max-md:flex-col justify-between max-md:gap-8 w-full items-center">
          <h1 className="font-bold text-6xl text-center">
            {name && `Hey, ${name}!`}
          </h1>
          {showCourse && (
            <a href="/course" className="btn btn-info btn-md max-md:btn-sm">
              View course
            </a>
          )}
        </div>
        {children}
      </section>
    </section>
  );
};

export default DashboardLayout;
