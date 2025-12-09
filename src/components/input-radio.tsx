import clsx from "clsx";
import { useEffect, useState } from "react";

const InputRadio = (props: any) => {
  const { checked, onChange } = props;

  const [_checked, _setChecked] = useState(checked);

  useEffect(() => {
    _setChecked(checked);
  }, [checked]);

  return (
    <div
      className={clsx(
        "button w-[16px] h-[16px] border border-[#D7E1F1] rounded-full flex justify-center items-center shrink-0 duration-300",
        _checked ? "bg-[#00AE6F]" : "bg-white"
      )}
      onClick={() => {
        _setChecked(!_checked);
        onChange?.(!_checked);
      }}
    >
      {_checked && (
        <img
          src="/icon-check.svg"
          className="w-[9px] h-[7px] object-center object-contain shrink-0"
        />
      )}
    </div>
  );
};

export default InputRadio;
