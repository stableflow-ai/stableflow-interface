import clsx from "clsx";
import { useEffect, useState } from "react";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  /**
   * Background color when checked, defaults to #00AE6F
   */
  checkedColor?: string;
  /**
   * Border color when unchecked, defaults to #D7E1F1
   */
  borderColor?: string;
  /**
   * Background color when unchecked, defaults to white
   */
  uncheckedBgColor?: string;
  /**
   * Size of the checkbox, defaults to 16px
   */
  size?: number;
}

const Checkbox = ({
  checked = false,
  onChange,
  disabled = false,
  className,
  children,
  checkedColor = "#00AE6F",
  borderColor = "#D7E1F1",
  uncheckedBgColor = "white",
  size = 16,
}: CheckboxProps) => {
  const [_checked, _setChecked] = useState(checked);

  useEffect(() => {
    _setChecked(checked);
  }, [checked]);

  const handleClick = () => {
    if (disabled) return;
    const newChecked = !_checked;
    _setChecked(newChecked);
    onChange?.(newChecked);
  };

  const checkboxElement = (
    <div
      className={clsx(
        "button flex justify-center items-center shrink-0 duration-300",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && "cursor-pointer"
      )}
      onClick={handleClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        backgroundColor: _checked ? checkedColor : uncheckedBgColor,
      }}
    >
      {_checked && (
        <img
          src="/icon-check.svg"
          className="w-[9px] h-[7px] object-center object-contain shrink-0"
          alt="checked"
        />
      )}
    </div>
  );

  if (children) {
    return (
      <div
        className={clsx(
          "flex items-center gap-2",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer",
          className
        )}
        onClick={handleClick}
      >
        {checkboxElement}
        <span className="flex-1">{children}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {checkboxElement}
    </div>
  );
};

export default Checkbox;

