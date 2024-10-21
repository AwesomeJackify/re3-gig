import React from "react";
import { Icon } from "@iconify/react";
import logo from "../assets/images/logo.png";

interface Props {
  showSettings?: boolean;
}

const DashboardNav = ({ showSettings = true }: Props) => {
  return (
    <nav className="absolute items-start top-0 left-0 w-full p-4 flex justify-between">
      <div className="flex flex-col gap-4">
        <a href="/dashboard">
          <img src={logo.src} width={200} className="w-24 bg-black" />
        </a>
        {showSettings && (
          <a href="/dashboard/settings">
            <Icon
              icon="mdi:settings"
              className="text-6xl p-1 bg-white text-black rounded-full border-black border-4 hover:bg-primary transition hover:text-white"
            />
          </a>
        )}
      </div>
      <form action="/api/auth/signout" method="get">
        <button type="submit" className="btn btn-primary btn-sm">
          Sign out
        </button>
      </form>
    </nav>
  );
};

export default DashboardNav;
