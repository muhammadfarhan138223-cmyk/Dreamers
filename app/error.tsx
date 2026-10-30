'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main style={{padding:40}}><h1>Let’s get you learning again.</h1><p>Your saved learning data stays on this device. Try loading the page again.</p><button onClick={reset}>Try again</button></main>}
