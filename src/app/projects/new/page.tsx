'use client';
import {useState} from "react";
export default function NewProject(){const [form,setForm]=useState({name:"",sourceUrl:"",sourceProvider:"GITHUB",sourceRef:"main",visibility:"PRIVATE",chartStrategy:"HYBRID",templateKind:"WEB"});
const [message,setMessage]=useState("");
function change(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>){setForm({...form,[e.target.name]:e.target.value});}
async function submit(e:React.FormEvent){e.preventDefault();setMessage("Registering…");const r=await fetch("/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok){setMessage(d.error??"Registration failed");return;}location.href=`/projects/${d.id}`;}
return <div className="card p-4" style={{maxWidth:760}}><h1 className="h4">Register project</h1><form onSubmit={submit} className="row g-3">
{[["name","Project slug"],["sourceUrl","Git clone URL"],["sourceRef","Branch or ref"]].map(([name,label])=><div className="col-12" key={name}><label className="form-label">{label}</label><input required className="form-control" name={name} value={(form as any)[name]} onChange={change}/></div>)}
{([["sourceProvider","Source provider",["GITHUB","GITLAB","GITEA"]],["visibility","Visibility",["PRIVATE","PUBLIC"]],["chartStrategy","Chart generation",["HYBRID","AUTO","TEMPLATE"]],["templateKind","Workload type",["WEB","API","WORKER","CRONJOB","STATEFUL"]]] as const).map(([name,label,opts])=><div className="col-md-6" key={name}><label className="form-label">{label}</label><select className="form-select" name={name} value={(form as any)[name]} onChange={change}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>)}
<div className="col-12"><button className="btn btn-info text-dark">Register</button> <span className="text-muted ms-2">{message}</span></div></form></div>}
