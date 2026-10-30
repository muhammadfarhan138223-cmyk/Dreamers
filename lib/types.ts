export type Lesson={id:string;title:string;subtitle:string;minutes:number;objective:string;paragraphs:string[];example:string;simple:string;takeaways:string[];check:string};
export type Question={id:string;topic:string;prompt:string;options:string[];answer:number;explanation:string;type:string;marks:number;difficulty:string;verification:string;source:string};
export type Written={id:string;topic:string;type:string;marks:number;prompt:string;answer:string;keyPoints:string[]};
export type Pack={id:string;version:number;title:string;subject:string;class:string;board:string;edition:string;academicYear:string;verification:string;license:string;description:string;lessons:Lesson[];questions:Question[];written:Written[]};
export type LearningEvent={id:string;kind:'lesson'|'attempt'|'review';target:string;correct?:boolean;answer?:number;at:number};
export type RecordValue={id:string;[key:string]:unknown};
