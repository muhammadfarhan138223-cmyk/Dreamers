// Original practice aligned to the inspected Biology XII chapter heading.
// Physiology cross-checked with NIDDK: https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work
export const URINARY_CHAPTER = "bio12-2";

export const urinaryMission = [
  {
    id: "entrance",
    stage: "01 · Reach the kidney",
    story:
      "You are guiding a tiny courier along the bloodstream. The filter station is in the kidney. Which road brings blood to its entrance?",
    question: "Which vessel carries blood into the kidney?",
    options: ["Renal vein", "Renal artery", "Ureter"],
    correct: 1,
    explanation:
      "The renal artery brings blood to the kidney. The renal vein carries blood away. The ureter carries urine.",
  },
  {
    id: "filter",
    stage: "02 · Find the filter",
    story:
      "The courier reaches the nephron. Your first job is to direct small dissolved substances through the filtration checkpoint.",
    question: "Which cluster of capillaries filters blood in the nephron?",
    options: ["Glomerulus", "Collecting duct", "Urethra"],
    correct: 0,
    explanation:
      "The glomerulus is a capillary cluster. Its filtration barrier lets water and many small solutes enter the space in Bowman’s capsule.",
  },
  {
    id: "barrier",
    stage: "03 · Guard the checkpoint",
    story:
      "Water, urea and a red blood cell reach the checkpoint. Send the passenger that normally stays in the bloodstream back down the blood lane.",
    question:
      "Which is normally kept in the blood during glomerular filtration?",
    options: ["Water", "Urea", "A red blood cell"],
    correct: 2,
    explanation:
      "Red blood cells are too large to pass through a healthy filtration barrier. Water and small dissolved molecules can pass.",
  },
  {
    id: "recovery",
    stage: "04 · Rescue the supplies",
    story:
      "Some glucose passed the checkpoint with the water. The courier needs to return the glucose to the blood before the liquid leaves the kidney.",
    question:
      "What is the movement of useful substances from the tubule back into the blood called?",
    options: ["Tubular secretion", "Tubular reabsorption", "Urine storage"],
    correct: 1,
    explanation:
      "Reabsorption means moving substances from the tubule toward the blood. The proximal tubule normally reabsorbs filtered glucose.",
  },
  {
    id: "secretion",
    stage: "05 · Clear the waste",
    story:
      "The blood still has extra hydrogen ions. The kidney needs a way to move them into the tubule for removal.",
    question:
      "What process moves selected substances from the blood into tubular fluid?",
    options: [
      "Tubular secretion",
      "Tubular reabsorption",
      "Bladder contraction",
    ],
    correct: 0,
    explanation:
      "Tubular secretion adds substances such as hydrogen ions to tubular fluid. Reabsorption moves substances in the opposite direction.",
  },
  {
    id: "route",
    stage: "06 · Trace the exit",
    story:
      "Your team has finished processing the fluid. Now guide the urine from the kidney all the way out of the body.",
    question: "What is the route of urine after it leaves the kidney?",
    options: [
      "Urethra → bladder → ureter",
      "Bladder → ureter → urethra",
      "Ureter → bladder → urethra",
    ],
    correct: 2,
    explanation:
      "The ureter carries urine to the bladder. The bladder stores it. The urethra carries it out of the body.",
  },
  {
    id: "two-lanes",
    stage: "07 · Rebuild the map",
    story:
      "Someone swapped the labels for the blood exit and the urine exit. Which pair should you put back on the signs?",
    question:
      "Which pair correctly identifies blood and urine leaving a kidney?",
    options: [
      "Blood: ureter. Urine: renal vein.",
      "Blood: renal vein. Urine: ureter.",
      "Blood: urethra. Urine: renal artery.",
    ],
    correct: 1,
    explanation:
      "The renal vein is part of circulation. The ureter is part of the urinary tract. They carry different fluids away from the kidney.",
  },
  {
    id: "why",
    stage: "08 · Save the city",
    story:
      "The filter still works, but the recovery station stops sending useful material back. Predict the problem before the courier leaves.",
    question:
      "What would happen if tubular reabsorption fell sharply while filtration continued?",
    options: [
      "More water and useful solutes would be lost in urine.",
      "Blood cells would immediately stop circulating.",
      "The bladder would make extra glucose.",
    ],
    correct: 0,
    explanation:
      "Much of the filtered water and useful solutes normally returns to blood. Reducing that recovery increases their loss in urine.",
  },
];

export const urinaryWritten = [
  {
    id: "filter-v-recover",
    type: "short",
    marks: 2,
    question: "Distinguish glomerular filtration from tubular reabsorption.",
    answer:
      "Glomerular filtration moves water and small solutes from the blood into Bowman’s capsule. Tubular reabsorption returns selected substances and water from tubular fluid to the blood.",
  },
  {
    id: "two-tubes",
    type: "short",
    marks: 2,
    question: "Give one function each of the ureter and the urethra.",
    answer:
      "A ureter carries urine from a kidney to the bladder. The urethra carries stored urine from the bladder to the outside.",
  },
  {
    id: "retain",
    type: "short",
    marks: 2,
    question:
      "Why do red blood cells usually stay in the blood during filtration?",
    answer:
      "The healthy glomerular barrier is selectively permeable. Red blood cells are too large to pass through it, whereas water and many small solutes can pass.",
  },
  {
    id: "three-processes",
    type: "long",
    marks: 4,
    question:
      "Describe filtration, reabsorption and secretion, then trace the urine to the outside.",
    answer:
      "Glomerular pressure drives water and small solutes into Bowman’s capsule while cells and most large proteins stay in the blood. Tubular reabsorption returns needed solutes and much of the water to the blood. Tubular secretion moves selected substances such as hydrogen ions from blood into the tubular fluid. The remaining urine passes through collecting ducts, enters the renal pelvis, and goes down the ureter to the bladder, then out through the urethra.",
  },
];
