import type { ReactNode } from "react";

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

/** Renders the small Markdown subset the proposal prompt asks for. */
export function ProposalDoc({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`l${out.length}`} className="my-3 list-disc space-y-1.5 pl-5 marker:text-primary">
          {list.map((x, i) => <li key={i}>{inline(x)}</li>)}
        </ul>,
      );
      list = [];
    }
  };
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (/^[-*] /.test(line)) { list.push(line.slice(2)); return; }
    flush();
    if (!line) return;
    if (line.startsWith("### ")) out.push(<h3 key={out.length} className="mt-6 text-xl">{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ") || line.startsWith("# "))
      out.push(<h2 key={out.length} className="mt-10 border-b border-border pb-2 text-2xl text-primary first:mt-0">{inline(line.replace(/^#+ /, ""))}</h2>);
    else out.push(<p key={out.length} className="my-3">{inline(line)}</p>);
  });
  flush();
  return <div className="leading-relaxed">{out}</div>;
}

/** Plain-text version for the clipboard. */
export const proposalPlain = (t: string) => t.replace(/\*\*/g, "").replace(/^#+ /gm, "");
