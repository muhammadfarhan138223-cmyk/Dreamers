// Parse the text layer of a locally saved PDF. Keep a link to the printed
// page because PDF extraction can change mathematical or chemical notation.
const start =
  /^(?:(?:section\s*\d+\s*[:.\-]?|q\s*\.?\s*1\s*[.):\-]?)\s*)?(?:mu(?:lti|iti|ti)ple\s+choice\s+questions?|mcqs?)\b/i;
const end =
  /^(?:(?:section\s*\d+\s*[:.\-]?|q\s*\.?\s*\d+\s*[.):\-]?)\s*)?(?:short[ -]+(?:answer[ -]+)?questions?|constructed\s+response\s+questions?|long\s+(?:answer\s+)?questions?|numerical\s+problems?|answer\s+key)\b/i;
const numbered =
  /^((?:\d+\.\d+|\d+[.)]|[IVXLCDM]{1,7}[.)]))\s*(?=\p{L}|\p{N}|\()/u;
const option = /(?:^|\s)(?:\(\s*([a-d])\s*\)|([a-d])\))\s*/gi;
const unnumberedStem = /^(?:Which|What|How|Why|If|When|The|An?)(?:\s|parallel)/;

/** @typedef {{page:number, number:string, question:string, options:string[]}} ExerciseMcq */
/**
 * @param {Array<{page:number,text:string}>} pages
 * @returns {ExerciseMcq[]}
 */
export function extractExerciseMcqs(pages) {
  const questions = [];
  const seen = new Set();
  let inSection = false;
  let current = null;
  let unnumbered = 0;
  function flush() {
    if (!current) return;
    const body = current.lines.join(" ").replace(/\s+/g, " ").trim();
    const marks = [...body.matchAll(option)];
    if (
      marks.length === 4 &&
      marks.map((m) => (m[1] || m[2]).toLowerCase()).join("") === "abcd"
    ) {
      const question = body.slice(0, marks[0].index).trim();
      const options = marks.map((mark, i) =>
        body.slice(mark.index + mark[0].length, marks[i + 1]?.index).trim(),
      );
      const signature = [question, ...options].join("|").toLowerCase();
      if (
        question.length >= 9 &&
        options.every(Boolean) &&
        new Set(options.map((value) => value.toLowerCase())).size === 4 &&
        !seen.has(signature)
      ) {
        seen.add(signature);
        questions.push({
          page: current.page,
          number: current.number,
          question,
          options,
        });
      }
    }
    current = null;
  }
  for (const { page, text } of pages) {
    for (const raw of text.split("\n")) {
      const line = raw
        .replace(/[\u0000-\u0008]/g, "")
        .replace(/www\.taleem360\.com/gi, "")
        .trim();
      if (
        !line ||
        /^\d{1,3}$/.test(line) ||
        /^www\./i.test(line) ||
        /^\d+\s+chap\b/i.test(line)
      )
        continue;
      const heading = line.replace(/^(?:[\[\]|]+|[Eq](?=\s))\s*/, "");
      if (
        start.test(heading) ||
        /^choose\s+the\s+correct\s*answer\s*[:.]?$/i.test(heading)
      ) {
        flush();
        inSection = true;
      } else if (inSection && end.test(heading)) {
        flush();
        inSection = false;
      } else if (inSection) {
        const match = numbered.exec(line);
        if (match) {
          flush();
          current = {
            page,
            number: match[1].replace(/[.)]$/, ""),
            lines: [line.slice(match[0].length)],
          };
        } else if (
          current &&
          unnumberedStem.test(line) &&
          line.length > 30 &&
          current.lines.some((part) =>
            /(?:^|\s)(?:\(\s*d\s*\)|d\))/i.test(part),
          )
        ) {
          flush();
          current = {
            page,
            number: `unlabelled-${++unnumbered}`,
            lines: [line],
          };
        } else if (current && !/^choose\s+the\s+correct/i.test(line)) {
          current.lines.push(line);
        }
      }
    }
  }
  flush();
  return questions;
}

// Reviewed for the supplied Biology XII fingerprint. Exact option matching
// prevents a changed or malformed extraction from receiving a key.
const reviewedBiology = {
  "bio12-1": {
    10: {
      1: "Homeostasis",
      2: "Drinking seawater",
      3: "Osmosis",
      4: "Internal metabolism",
      5: "Hypothalamus",
      6: "Ammonia",
      7: "Uric acid",
      8: "Liver",
    },
  },
  "bio12-2": {
    23: {
      1: "Collecting duct",
      2: "Reabsorbed from the proximal convoluted tubule to blood",
      3: "Afferent renal arteriole",
      4: "Glucose",
      5: "Collecting duct",
      6: "Proximal convoluted tubule",
      7: "Glucose",
    },
    24: {
      8: "Formation of dilute urine",
      9: "Abdomen",
      10: "Kidney transplant",
    },
  },
  "bio12-5": {
    81: {
      1: "Oviduct",
      2: "Leydig cells",
      3: "Seminiferous tubules",
      4: "Seminal vesicles",
      5: "Follicle stimulating hormone",
      6: "Secondary oocyte",
      7: "LH",
    },
  },
};
export function reviewedExerciseAnswer(bookId, chapterId, item) {
  if (
    bookId !== "biology-xii-supplied" ||
    !Object.hasOwn(reviewedBiology, chapterId)
  )
    return undefined;
  const answer = reviewedBiology[chapterId]?.[item.page]?.[item.number];
  const index = item.options.indexOf(answer);
  return index >= 0 ? index : undefined;
}
