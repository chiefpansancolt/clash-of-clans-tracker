import { Fragment } from "react";
import { RiArrowRightLine } from "react-icons/ri";

export const LabelWithArrow = ({ label, iconSize = 10 }: { label: string; iconSize?: number }) => {
  const parts = label.split("→");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <RiArrowRightLine size={iconSize} className="inline mx-0.5 shrink-0" />}
        </Fragment>
      ))}
    </>
  );
};
