import { readerChapter, readerIntent } from "./reader-retrieval.mjs";
// Original answer wording based on the supplied source, NOT an official board key.
// Question section: PDF9/printed5; supporting story: PDF6–8. Educator review pending.
export const TAIF_SHORTS = [
  {
    n: 1,
    page: 6,
    enQ: "Why did Hazrat Muhammad (PBUH) travel to Taif?",
    enA: "He travelled to invite the people of Taif to Islam and share the message of Tawheed.",
    urQ: "Hazrat Muhammad (PBUH) Taif kyun gaye?",
    urA: "Aap Taif ke logon ko Islam ka paigham dene gaye. Tawheed ka matlab hai: Allah aik hai.",
  },
  {
    n: 2,
    page: 6,
    enQ: "How did the chiefs of Taif respond to the message of Islam?",
    enA: "They rejected the message and spoke to him in a rude and mocking way.",
    urQ: "Taif ke sardaron ne Islam ka paigham sun kar kya kiya?",
    urA: "Unhon ne paigham qabool nahi kiya aur Aap se buri tarah baat ki.",
  },
  {
    n: 3,
    page: 6,
    enQ: "What did he ask the chiefs at the end of their meeting?",
    enA: "He asked them to keep their views to themselves so that others would not be misguided.",
    urQ: "Mulaqat ke aakhir mein Aap ne sardaron se kya kaha?",
    urA: "Aap ne kaha ke apni rai apne tak rakhein, taa-ke doosre log ghalat soch mein na par jaayein.",
  },
  {
    n: 4,
    page: 6,
    enQ: "How did the people treat him while he was preaching?",
    enA: "They chased him and threw stones at him. He was badly injured, and blood reached his shoes.",
    urQ: "Jab Aap logon ko paigham de rahe thay to unhon ne kya kiya?",
    urA: "Logon ne Aap ka peechha kiya aur pathar maare. Aap zakhmi ho gaye aur khoon jooton tak aa gaya.",
  },
  {
    n: 5,
    page: 7,
    enQ: "Who was Addaas, and how did he respond to meeting him?",
    enA: "Addaas was a Christian servant from Naynawa who brought grapes. After hearing him speak about Hazrat Yunus, Addaas kissed his head, hands and feet to show respect.",
    urQ: "Addaas kaun tha aur mulaqat ke baad us ne kya kiya?",
    urA: "Addaas Naynawa ka aik Isai ghulam tha jo angoor laya. Hazrat Yunus ke baare mein Aap ki baat sun kar us ne Aap ke sar, haath aur paon choom kar izzat ka izhaar kiya.",
  },
  {
    n: 6,
    page: 7,
    enQ: "What happened when he was severely injured?",
    enA: "He fell unconscious. Hazrat Zayd bin Haritha carried him out of the city and sprinkled water on his face until he regained consciousness.",
    urQ: "Zyada zakhmi hone par kya hua aur kis ne madad ki?",
    urA: "Aap behosh ho gaye. Hazrat Zayd bin Haritha Aap ko peeth par utha kar shehar se bahar laaye. Unhon ne chehre par paani ke chheentay diye, phir Aap ko hosh aa gaya.",
  },
  {
    n: 7,
    page: 7,
    enQ: "What does his supplication reveal about his character and faith?",
    enA: "It shows humility and strong trust in Allah. Despite his suffering, he sought Allah’s protection and was concerned about earning Allah’s pleasure.",
    urQ: "Aap ki dua se kirdar aur imaan ke baare mein kya pata chalta hai?",
    urA: "Aap takleef ke bawajood Allah par bharosa karte thay. Aap ne Allah se hifazat maangi aur Allah ki raza, yani Allah ko khush karna, sab se aham samjha.",
  },
  {
    n: 8,
    page: 8,
    enQ: "Why did he refuse to curse the people of Taif?",
    enA: "He chose forgiveness and hoped that their descendants would worship Allah alone.",
    urQ: "Aap ne Taif ke logon ko baddua kyun nahi di?",
    urA: "Aap ne maaf karna pasand kiya. Aap ko umeed thi ke un ki agli naslein sirf Allah ki ibadat karein gi.",
  },
];
export function preparedExerciseAnswer(
  catalog,
  question,
  conversation = [],
  language = "Roman Urdu",
  page = 1,
) {
  if (
    catalog?.id !== "english-xii-supplied" ||
    readerChapter(catalog, question, conversation, page)?.id !== "eng12-1" ||
    readerIntent(question) !== "exercise" ||
    !["English", "Roman Urdu"].includes(language)
  )
    return null;
  const q = question.toLowerCase();
  const count = /kitn|count|how many/.test(q),
    location = /page|safh|صفح/.test(q),
    mcq = /mcq|multiple.choice/.test(q);
  const heading =
    language === "English"
      ? "Prepared source-based answer · educator review pending"
      : "Kitab se tayyar kiya hua jawab · teacher review abhi baqi hai";
  if (count || location) {
    const text = mcq
      ? language === "English"
        ? "Section B has 8 MCQs on PDF page 10 (printed page 6)."
        : "Section B mein 8 MCQs hain. Yeh PDF page 10, yani kitab ke printed page 6 par hain."
      : language === "English"
        ? "Section A has 8 short-answer questions on PDF page 9 (printed page 5). Section B is separate: 8 MCQs on PDF10/printed6."
        : "Section A mein 8 short sawaal hain. Yeh PDF page 9, yani kitab ke printed page 5 par hain. MCQs alag Section B mein hain: 8 MCQs, PDF10/printed6.";
    return {
      answer: heading + "\n\n" + text,
      generated: false,
      prepared: true,
      sourcePages: mcq ? [10] : [9, 10],
    };
  }
  if (mcq || !/answer|jawab|batao|bata|سوال|جواب/.test(q)) return null;
  const number = q.match(/(?:question|sawaal|sawal|q\.?)\s*(\d+)\b/);
  const rows = number
    ? TAIF_SHORTS.filter((x) => x.n === Number(number[1]))
    : TAIF_SHORTS;
  if (!rows.length) return null;
  const text = rows
    .map((x) =>
      language === "English"
        ? `${x.n}. ${x.enQ}\n${x.enA}`
        : `${x.n}. ${x.urQ}\n${x.urA}`,
    )
    .join("\n\n");
  return {
    answer:
      heading + "\n\nJourney to Taif · Section A · PDF9 / printed5\n\n" + text,
    generated: false,
    prepared: true,
    sourcePages: [9, ...new Set(rows.map((x) => x.page))],
  };
}
