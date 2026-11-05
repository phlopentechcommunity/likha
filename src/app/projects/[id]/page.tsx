import {prisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function ProjectPage({params}:{params:Promise<{id:string}>}){const {id}=await params;
const p=await prisma.project.findUnique({where:{id},include:{releases:{orderBy:{createdAt:"desc"},take:10},scans:{orderBy:{createdAt:"desc"},take:10}}});
if(!p)return <div>Project not found.</div>;
return <><div className="d-flex justify-content-between"><div><h1 className="h3">{p.name}</h1><a href={p.sourceUrl}>{p.sourceUrl}</a><p className="text-muted">{p.sourceProvider} · {p.visibility} · {p.sourceRef}</p></div>
<form action={`/api/projects/${p.id}/build`} method="post"><button className="btn btn-info text-dark">Run build</button></form></div>
<div className="row g-3"><div className="col-lg-6"><div className="card p-3"><h2 className="h5">Releases</h2>{p.releases.map(r=><div className="border-bottom py-2" key={r.id}>{r.version} · {r.imageRef??"Image pending"} · {r.chartRef??"Chart pending"}</div>)}</div></div>
<div className="col-lg-6"><div className="card p-3"><h2 className="h5">Security scans</h2>{p.scans.map(s=><div className="border-bottom py-2" key={s.id}>{s.status} · {s.criticalCount} critical · {s.highCount} high · {s.createdAt.toISOString()}</div>)}</div></div></div></>;}
