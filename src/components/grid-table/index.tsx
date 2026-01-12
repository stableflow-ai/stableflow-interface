import clsx from "clsx";
import React, { useImperativeHandle, useMemo, useRef, useEffect } from "react";
import Empty from "../empty";
import Loading from "../loading/icon";

const GridTable = (props: Props, ref: any) => {
  const {
    data = [],
    columns,
    className,
    headerClassName,
    bodyClassName,
    rowClassName,
    headerRowClassName,
    bodyRowClassName,
    bodyRowStyle,
    colClassName,
    headerColClassName,
    bodyColClassName,
    emptyClassName,
    fixedClassName,
    sortDataIndex,
    sortDirection,
    onSort,
    loading,
    sortIconColor = ["#FBCA04", "white"],
    onRow,
  } = props;

  const headerRef = useRef<any>(null);
  const bodyRef = useRef<any>(null);

  // Sync horizontal scroll between header and body
  useEffect(() => {
    const bodyElement = bodyRef.current;
    const headerElement = headerRef.current;

    if (!bodyElement || !headerElement) return;

    const handleScroll = () => {
      headerElement.scrollLeft = bodyElement.scrollLeft;
    };

    handleScroll();

    bodyElement.addEventListener('scroll', handleScroll);
    return () => {
      bodyElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [gridTemplateColumns] = useMemo(() => {
    return [
      columns.map((col: any) => {
        return col.width
          ? (
            typeof col.width === "number"
              ? `${col.width}px`
              : col.width
          )
          : "auto";
      }).join(' ')
    ];
  }, [columns]);

  const renderColStyles = (col: any, isBody?: boolean) => {
    const ellipsis: any = {};
    if (col.ellipsis) {
      ellipsis.overflow = "hidden";
      ellipsis.textOverflow = "ellipsis";
      ellipsis.whiteSpace = "nowrap";
    }
    return {
      textAlign: col.align || "left",
      justifyContent: col.align === "center"
        ? "center"
        : (
          col.align === "right"
            ? "flex-end"
            : "flex-start"
        ),
      cursor: (col.sort && !isBody) ? "pointer" : "default",
      ...ellipsis,
    };
  };

  const refs = {};
  useImperativeHandle(ref, () => refs);

  return (
    <div
      className={clsx(
        "w-full md:overflow-x-auto text-[#2B3337] text-[14px] font-normal leading-[100%]",
        className
      )}
    >
      <div ref={headerRef} className={clsx("max-md:min-w-fit text-[#9FA7BA]", headerClassName)}>
        <div
          className={clsx(
            "grid gap-x-[10px] px-2 md:px-2 py-2 min-w-full",
            rowClassName,
            headerRowClassName
          )}
          style={{
            gridTemplateColumns,
            minWidth: 'max-content',
          }}
        >
          {
            columns.map((col: any, index: number) => (
              <div
                key={`grid-table-header-col-${index}`}
                className={clsx(
                  "flex items-center py-[10px]",
                  col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start",
                  col.sort && !loading ? "cursor-pointer" : "cursor-default",
                  col.fixed ? `sticky left-0 bg-[#FFF1C7] ${fixedClassName}` : "",
                  colClassName,
                  headerColClassName
                )}
                style={renderColStyles(col)}
                onClick={() => {
                  if (col.sort && !loading) {
                    let nextDirection = sortDirection === "asc" ? "desc" : "asc";
                    if (sortDataIndex !== col.dataIndex) {
                      nextDirection = "asc";
                    }
                    onSort?.(col.dataIndex, nextDirection as GridTableSortDirection);
                  }
                }}
              >
                {
                  typeof col.title === "function"
                    ? col.title(col, index)
                    : (
                      <div
                        className={clsx(
                          "inline-block",
                          col.ellipsis && "overflow-hidden text-ellipsis whitespace-nowrap"
                        )}
                        title={(col.ellipsis && typeof col.title === "string") && col.title}
                      >
                        {col.title}
                      </div>
                    )
                }
                {
                  col.sort && (
                    <div className="flex-shrink-0 w-[7px] h-[10px] ml-[6px]">
                      <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3.5 0L6.53109 3H0.468911L3.5 0Z"
                          fill={(sortDirection === "asc" && sortDataIndex === col.dataIndex) ? sortIconColor[0] : sortIconColor[1]}
                          fillOpacity={(sortDirection === "asc" && sortDataIndex === col.dataIndex) ? 1 : 0.4}
                        />
                        <path
                          d="M3.5 10L6.53109 7H0.468911L3.5 10Z"
                          fill={(sortDirection === "desc" && sortDataIndex === col.dataIndex) ? sortIconColor[0] : sortIconColor[1]}
                          fillOpacity={(sortDirection === "desc" && sortDataIndex === col.dataIndex) ? 1 : 0.4}
                        />
                      </svg>
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
      </div>
      <div
        ref={bodyRef}
        className={clsx(
          "max-md:min-w-fit text-[16px] font-normal",
          bodyClassName
        )}
      >
        {
          loading ? (
            <div className="flex justify-center items-center min-h-[150px]">
              <Loading />
            </div>
          ) : (
            data?.length > 0 ? data.map((item: any, index: number) => (
              <div
                key={`grid-table-body-row-${index}`}
                className={clsx(
                  "grid gap-x-[10px] px-2 min-w-full odd:bg-[#FAFBFF] hover:bg-[#f5f5f5] duration-150",
                  rowClassName,
                  bodyRowClassName
                )}
                style={{
                  gridTemplateColumns,
                  minWidth: 'max-content',
                  ...(typeof bodyRowStyle === "function" ? bodyRowStyle(item, index) : bodyRowStyle)
                }}
                onClick={() => {
                  onRow?.(item, index);
                }}
              >
                {
                  columns.map((col: any, idx: number) => (
                    <div
                      key={`grid-table-body-col-${idx}`}
                      className={clsx(
                        "flex items-center py-[15px]",
                        col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start",
                        col.fixed ? `sticky left-0 ${index % 2 === 0 ? "bg-[#FFF1C7]" : "bg-[#FFF1C7]"} ${fixedClassName}` : "",
                        colClassName,
                        bodyColClassName
                      )}
                      style={renderColStyles(col, true)}
                    >
                      {
                        typeof col.render === "function"
                          ? (
                            <div className={clsx(
                              "inline-block max-w-full",
                              col.ellipsis && "overflow-hidden text-ellipsis whitespace-nowrap"
                            )}>
                              {col.render(item, index, col, idx)}
                            </div>
                          )
                          : (
                            <div
                              className={clsx(
                                "inline-block max-w-full",
                                col.ellipsis && "overflow-hidden text-ellipsis whitespace-nowrap"
                              )}
                              title={col.ellipsis && item[col.dataIndex]}
                            >
                              {item[col.dataIndex]}
                            </div>
                          )
                      }
                    </div>
                  ))
                }
              </div>
            )) : (
              <div className={clsx("flex justify-center items-center min-h-[200px]", emptyClassName)}>
                <Empty desc="No data yet..." />
              </div>
            )
          )
        }
      </div>
    </div>
  );
};

export default React.forwardRef<any, Props>(GridTable);

export interface Props {
  data?: Record<string, any>[];
  columns: {
    dataIndex: string;
    title: string | ((col: any, index: number) => any);
    align?: GridTableAlign;
    sort?: boolean;
    render?: (item: any, index: number, col: any, idx: number) => any;
    ellipsis?: boolean;
    width?: string | number;
  }[];
  loading?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string;
  bodyRowStyle?: React.CSSProperties | ((item: any, index: number) => React.CSSProperties);
  colClassName?: string;
  headerColClassName?: string;
  bodyColClassName?: string;
  emptyClassName?: string;
  fixedClassName?: string;
  sortDataIndex?: string;
  sortDirection?: GridTableSortDirection;
  sortIconColor?: string[];
  onSort?: (dataIndex: string, direction: GridTableSortDirection) => void;
  onRow?: (item: any, index: number) => void;
}

export type GridTableAlign = "left" | "center" | "right";

export type GridTableSortDirection = "asc" | "desc";
