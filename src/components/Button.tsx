export interface IProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export default function Button(props: IProps) {
  const { className = "", ...rest } = props;
  return (
    <button
      className={`px-4 py-1 border rounded border-paper_fg bg-paper_bg hover:bg-paper_bg_800 hover:drop-shadow-md ${className}`}
      {...rest}
    />
  );
}
