import Search from "@/components/search";
import QueryToggle from "@/components/toggle";
import VisitClickHouseCloud from "@/components/visit-clickhouse";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({ children }) {
  return (
    <div className="pb-20">
      <div className="hidden fixed inset-y-0 z-50 xl:flex w-20 flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-nav px-2 pb-2">
          <div className="flex h-16 shrink-0 items-center mt-6 ml-0">
            <Link href="/">
              <Image
                className="h-16 w-16"
                src="/logo.svg"
                alt="ClickPy"
                width={41}
                height={42}
              />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">{/* maybe later nav  */}</nav>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center p-6 lg:px-8">
        <div className="xl:ml-28 ml-10">
          <Search />
        </div>
        <div className="hidden xl:flex justify-end">
          <div className="mr-2">
            <QueryToggle />
          </div>
          <div className="py-3">
            <VisitClickHouseCloud />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
