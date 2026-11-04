import { Fragment } from "react";
import { highlightPassage } from "@/lib/book-retrieval.mjs";

export default function PassageHighlight({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  return highlightPassage(text, query).map((part, index) =>
    part.match ? (
      <mark className="passage-mark" key={index}>
        {part.text}
      </mark>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    ),
  );
}
