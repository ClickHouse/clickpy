import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

export default function VisitClickHouseCloud({ current, latest }) {
  return (
    <a
      href="https://clickhouse.com/cloud?utm_source=clickpy&utm_medium=web&utm_campaign=cloud"
      target="_blank"
    >
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
  );
}
