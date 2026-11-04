import { ExternalLink } from "lucide-react";
import { biologyXi2026 as scheme } from "@/lib/board-exam-patterns.mjs";

export default function BiologyBoardPattern() {
  return (
    <section className="book-exam-plan" aria-labelledby="biology-2026-pattern">
      <span className="eyebrow">PECTAA · PUNJAB · HISTORICAL REFERENCE</span>
      <h2 id="biology-2026-pattern">Biology XI · {scheme.session}</h2>
      <p>
        Official pattern for Annual 2026. Check your exam year before using its
        chapter exclusions.
      </p>
      <div className="exam-summary">
        <span>
          <b>{scheme.totalMarks}</b> total marks
        </span>
        <span>
          <b>{scheme.objective.marks}</b> MCQs · {scheme.objective.minutes} min
        </span>
        <span>
          <b>68</b> written marks · {scheme.subjectiveMinutes} min
        </span>
      </div>
      <details className="subject-test-details">
        <summary>View chapter counts and long pairs</summary>
        <p>
          Each short answer carries 2 marks. Counts below show questions
          offered.
        </p>
        <div className="board-pattern-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Chapter</th>
                <th scope="col">MCQ</th>
                <th scope="col">Q2</th>
                <th scope="col">Q3</th>
                <th scope="col">Q4</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheme.objective.byChapter).map(
                ([chapter, count]) => (
                  <tr key={chapter}>
                    <th scope="row">{chapter}</th>
                    <td>{count}</td>
                    {scheme.shortGroups.map((group) => (
                      <td key={group.number}>
                        {Object.entries(group.chapters).find(
                          ([id]) => id === chapter,
                        )?.[1] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
        <ul>
          {scheme.shortGroups.map((group) => (
            <li key={group.number}>
              Q{group.number}: attempt {group.attempt} of {group.offered}
            </li>
          ))}
          <li>
            Long questions: attempt {scheme.long.attempt} of{" "}
            {scheme.long.offered}, {scheme.long.partMarks} marks per part.
          </li>
        </ul>
        <ul>
          {scheme.long.pairs.map((pair) => (
            <li key={pair.number}>
              Q{pair.number}: chapters {pair.chapters.join(" + ")}
            </li>
          ))}
        </ul>
        <p>
          Chapter 7 was excluded in this session’s ALP. Refer to Annex A for the
          topic-level list.
        </p>
      </details>
      <a
        className="secondary"
        href={scheme.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        BISE Sargodha notification PDF <ExternalLink size={15} />
      </a>
    </section>
  );
}
