export interface IProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export default function Button(props: IProps) {
  const { className = "", ...rest } = props;

  let classes = [
    `px-4 py-1 border rounded border-paper_fg bg-paper_bg hover:bg-paper_bg_800 hover:drop-shadow-md`,
  ];

  if (rest.disabled) {
    classes.push("opacity-50 cursor-not-allowed");
  }

  classes.push(className);

  return <button className={classes.join(" ")} {...rest} />;
}
