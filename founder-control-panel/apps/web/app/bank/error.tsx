'use client';
export default function ErrorView({reset}:{error:Error;reset:()=>void}){return <main className="container"><section className="card"><p style={{color:'#b91c1c'}}>Something went wrong.</p><button onClick={reset}>Retry</button></section></main>;}
