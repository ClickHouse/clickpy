import SparkLine from "./charts/sparkline";
import { getProjectCount, getRecentPackageDownloads } from "@/utils/clickhouse";
import Link from "next/link";
import "server-only";

async function getPackageData() {
  // replace with materialied view to compute top K
  const packages = await getProjectCount();
  const downloads = await Promise.all(
    packages.map((p) => getRecentPackageDownloads(p.project))
  );
  return downloads.map((data, i) => {
    return { name: packages[i].project, data: data, total: packages[i].c };
  });
}

export default async function Summary() {
  const packageData = await getPackageData();
  return (
    <div className="flex flex-col grow lg:grid lg:grid-cols-6 lg:grid-rows-2 gap-4 lg:h-[480px] lg:min-h-[480px] min-w-[350px] ">
      <div className="lg:col-span-2">
        <Link href={`/dashboard/${packageData[0].name}`}>
          <SparkLine
            data={packageData[0].data}
            name={packageData[0].name}
            total={packageData[0].total}
            link={`/dashboard/${packageData[0].name}`}
          />
        </Link>
      </div>
      <div className="justify-self align-self lg:row-span-2 lg:col-span-2">
        <Link href={`/dashboard/${packageData[1].name}`}>
          <SparkLine
            data={packageData[1].data}
            name={packageData[1].name}
            total={packageData[1].total}
            link={`/dashboard/${packageData[1].name}`}
          />{" "}
        </Link>
      </div>
      <div className="lg:col-span-2">
        <Link href={`/dashboard/${packageData[2].name}`}>
          <SparkLine
            data={packageData[2].data}
            name={packageData[2].name}
            total={packageData[2].total}
            link={`/dashboard/${packageData[2].name}`}
          />{" "}
        </Link>
      </div>
      <div>
        <Link href={`/dashboard/${packageData[3].name}`}>
          <SparkLine
            data={packageData[3].data}
            name={packageData[3].name}
            total={packageData[3].total}
            link={`/dashboard/${packageData[3].name}`}
          />{" "}
        </Link>
      </div>
      <div>
        <Link href={`/dashboard/${packageData[4].name}`}>
          <SparkLine
            data={packageData[4].data}
            name={packageData[4].name}
            total={packageData[4].total}
            link={`/dashboard/${packageData[4].name}`}
          />{" "}
        </Link>
      </div>
      <div className="lg:col-span-2">
        <Link href={`/dashboard/${packageData[5].name}`}>
          <SparkLine
            data={packageData[5].data}
            name={packageData[5].name}
            total={packageData[5].total}
            link={`/dashboard/${packageData[5].name}`}
          />{" "}
        </Link>
      </div>
    </div>
  );
}
