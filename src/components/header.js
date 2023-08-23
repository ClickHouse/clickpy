import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import QueryToggle from "./toggle";
import Image from "next/image";
import VisitClickHouseCloud from "./visit-clickhouse";

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
          <VisitClickHouseCloud />
        </div>
      </nav>
    </header>
  );
}
