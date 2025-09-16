import clsx from "clsx";
import { useMemo } from "react";

const Pagination = (props: any) => {
  const { className, totalPage, page, pageSize, onPageChange } = props;

  const [firstValid, prevValid, nextValid, lastValid] = useMemo(() => {
    return [
      page > 1,
      page > 1,
      page < totalPage,
      page < totalPage,
    ];
  }, [page, totalPage, pageSize]);

  return (
    <div className={clsx(
      "flex items-center gap-[15px] text-[#532] font-unbounded text-[12px] font-light leading-[18px]",
      className
    )}>
      <PageButton
        onClick={() => {
          onPageChange(1);
        }}
        disabled={!firstValid}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity={firstValid ? "1" : "0.3"} d="M9 1L4.2 6L9 11M1 1V11" stroke="#532" />
        </svg>
      </PageButton>
      <PageButton
        onClick={() => {
          onPageChange(page - 1);
        }}
        disabled={!prevValid}
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity={prevValid ? "1" : "0.3"} d="M6 1L1 6L6 11" stroke="#532" />
        </svg>
      </PageButton>
      <div className="flex items-center">
        {page}/{totalPage}
      </div>
      <PageButton
        onClick={() => {
          onPageChange(page + 1);
        }}
        disabled={!nextValid}
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity={nextValid ? "1" : "0.3"} d="M1 1L6 6L1 11" stroke="#532" />
        </svg>
      </PageButton>
      <PageButton
        onClick={() => {
          onPageChange(totalPage);
        }}
        disabled={!lastValid}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity={lastValid ? "1" : "0.3"} d="M1 1L5.8 6L1 11M9 1V11" stroke="#532" />
        </svg>
      </PageButton>
    </div>
  );
};

export default Pagination;

const PageButton = (props: any) => {
  const { className, children, ...restProps } = props;

  return (
    <button
      type="button"
      className={clsx("button w-[16px] h-[16px] flex-0 flex items-center justify-center disabled:!cursor-not-allowed", className)}
      {...restProps}
    >
      {children}
    </button>
  );
};
