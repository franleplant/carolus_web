export interface IProps {
  total: number;
  page: number;
  maxPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function Pagination({
  total,
  page,
  maxPages,
  onPrevPage,
  onNextPage,
}: IProps) {
  return (
    <div className="flex items-center justify-center py-2 gap-4 border-y border-y-paper_fg">
      <span>Total {total}</span>
      <span>
        Page {page}/{maxPages}
      </span>
      <button
        onClick={onPrevPage}
        className="px-4 py-1 border rounded border-paper_fg"
      >
        Previous
      </button>
      <button
        onClick={onNextPage}
        className="px-4 py-1 border rounded border-paper_fg"
      >
        Next
      </button>
    </div>
  );
}
