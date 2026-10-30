export function summarize(events){
 const lessons=new Set(), correct=new Set();let attempts=0,hits=0;const latest=new Map();
 for(const e of [...events].sort((a,b)=>a.at-b.at)){if(e.kind==='lesson')lessons.add(e.target);if(e.kind==='attempt'){attempts++;if(e.correct){hits++;correct.add(e.target)}latest.set(e.target,e)}}
 const xp=lessons.size*25+correct.size*10;
 return {completed:[...lessons],correct:[...correct],attempts,hits,xp,level:xp>=200?'Thinker':xp>=100?'Explorer':'Beginner',accuracy:attempts?Math.round(hits/attempts*100):null,mistakes:[...latest.values()].filter(e=>!e.correct).map(e=>e.target),achievements:[...(lessons.size?['First discovery']:[]),...(lessons.size>=4?['Cell explorer']:[]),...(correct.size>=10?['Curious mind']:[])]};
}
export function dueAt(previous,quality,now=Date.now()){
 const days=quality==='again'?0.01:quality==='hard'?1:Math.min(30,(previous||0)*2+2);return {interval:days,due:now+days*86400000};
}
