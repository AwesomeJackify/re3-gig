import React, { type ReactNode } from "react";
import { Icon } from "@iconify/react";
import logo from "../assets/images/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
  name: string;
  showCourse?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  name,
  showCourse,
}) => {
  return (
    <section className="pb-8">
      <nav className="absolute items-center top-0 left-0 w-full p-4 flex justify-between">
        <a href="/">
          <img src={logo.src} width={200} className="w-24 bg-black" />
        </a>
        <form action="/api/auth/signout" method="get">
          <button type="submit" className="btn btn-primary btn-sm">
            Sign out
          </button>
        </form>
      </nav>
      <section className="max-w-screen-2xl mx-auto pt-32 flex flex-col gap-16 px-4">
        <div className="flex max-md:flex-col max-md:gap-8 justify-between w-full items-center">
          <h1 className="font-bold text-6xl max-md:text-center">
            Hey, {name}!
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
