interface Props { dark?: boolean; items: string[] }

export default function Marquee({ dark = false, items }: Props) {
  const row = items.map(t => t + "  ◆  ").join("");
  const seq = row.repeat(4);
  return (
    <div className={"p5-marquee" + (dark ? " p5-marquee--dark" : "")}>
      <div className="p5-marquee-track">
        <span>{seq}</span>
        <span>{seq}</span>
      </div>
    </div>
  );
}
