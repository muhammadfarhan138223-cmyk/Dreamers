// Publisher links checked against the PECTAA e-books catalogue, 2026-11-04.
// A linked edition can differ from the hash-checked supplied copy.
export const PECTAA_CATALOGUE = "https://pectaa.edu.pk/curriculum-compliance/";
export const BISE_MODEL_PAPERS = "https://biselahore.com/model-papers/hssc";

const sources = {
  "biology-xii-supplied": "1e5B3_0-RLIhOvw6PPhJ4o6sjuiqgCtb8",
  "physics-xii-supplied": "1j0fVpaaMbChf0LYUdiizmSq5ZKy7myyP",
  "computer-xii-supplied": "1EYvLvQlb20T9ZGxL7wcxZhgVJtSf1Rlr",
  "chemistry-xi-supplied": "1l-XyH9tA6AQ-DRP9QlUgG8FreYzoHjR3",
  "urdu-grammar-supplied": "129lEy_rsYLa3CYS_j3s_0I8vnbyc_mG3",
  "english-grammar-supplied": "1MjEGc8wJjMhSyyWFghg_beASRVnEqELb",
  "english-xii-supplied": "1SUNMFPtc7RoW35MdX4vFT2f4D7Xo3B8C",
  "mathematics-xii-supplied": "1Dm1yRrWyxA7xxXvTDQGpu8C5AONdAsPb",
  "education-xii-legacy": "18jeujdyMCpyiyVSwI_8F63TUeXXcuQ7t",
  "urdu-xii-supplied": "16VYW69kAD2812Nk1tuA1pRhvB7WTyRG1",
  "computer-xi-supplied": "1eWO5ULWhPVDUyBbKX1WM8vymr2YxmYps",
  "geography-workbook-supplied": "1tJFcwvzPcybHxIxIY9h9UT0pTCAzstsb",
  "psychology-xii-legacy": "1ZRZtic47vymASUoqb6FUZ_R5L12oXObW",
  "quran-xii-supplied": "1BYO3WE1_zdfx3xdTEtz6h83eTsLfBPdY",
  "pakistan-studies-xii-supplied": "1WICBpbpMU375ik-mfH1dGOgHqr1unte6",
  "biology-xi-publisher": "1qEKiX0Gdpr_w2WgA7Ma4URd91UDTBVRk",
};
export const publisherUrl = (id) =>
  Object.hasOwn(sources, id)
    ? `https://drive.google.com/file/d/${sources[id]}/view`
    : null;

export const PUBLISHER_BIOLOGY_XI = {
  id: "biology-xi-publisher",
  title: "Biology",
  subject: "biology",
  class: "XI",
  classes: ["XI"],
  color: "mint",
  icon: "dna",
  edition: "PECTAA listing · 2025–26",
};
