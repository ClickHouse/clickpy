import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import QueryToggle from "./toggle";
import Image from "next/image";

export default function Header() {
  return (
    <header>
      <nav
        className="border-b-2 border-slate mx-auto flex items-center justify-between p-6 lg:px-8 w-full"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">ClickPy</span>
            <Image
              className="h-12 w-36"
              src="/click_py.svg"
              alt="ClickPy"
              width={150}
              height={48}
            />
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          <div className="mr-2">
            <QueryToggle />
          </div>
          <a href="https://clickhouse.com/cloud" target="_blank">
            <button
              type="button"
              className="h-full inline-flex items-center gap-x-2 rounded-md bg-primary-300 px-3.5 py-2.5 text-sm font-inter text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
            >
              Visit ClickHouse Cloud
              <ArrowTopRightOnSquareIcon
                className="-mr-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </a>
        </div>
      </nav>
    </header>
  );
}
