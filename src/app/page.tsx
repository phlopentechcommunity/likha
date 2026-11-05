import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Home() {
 const [projects, releases, scans, critical] = await Promise.all([
  prisma.project.count(), prisma.release.count(), prisma.securityScan.count(),
  prisma.vulnerability.count({where:{severity:"CRITICAL",fixedAt:null}})
 ]);
 const latest = await prisma.project.findMany({orderBy:{updatedAt:"desc"},take:8,
  include:{releases:{take:1,orderBy:{createdAt:"desc"}},scans:{take:1,orderBy:{createdAt:"desc"}}}});
 return <><div className="d-flex justify-content-between align-items-center mb-4">
 <div><h1 className="h3 mb-1">Project Factory</h1><p className="text-muted mb-0">Source repositories to secure OCI images and Helm charts.</p></div>
 <a className="btn btn-info text-dark fw-semibold" href="/projects/new">Add project</a></div>
 <div className="row g-3 mb-4">{[["Projects",projects],["Releases",releases],["Scans",scans],["Unfixed critical CVEs",critical]].map(([label,value])=>
 <div className="col-12 col-md-6 col-xl-3" key={String(label)}><div className="card p-3 h-100">
 <div className="text-muted">{label}</div><div className="stat">{value}</div></div></div>)}</div>
 <div className="card p-3"><h2 className="h5">Recent projects</h2><div className="table-responsive"><table className="table align-middle">
 <thead><tr><th>Project</th><th>Source</th><th>Visibility</th><th>Latest release</th><th>Latest scan</th><th></th></tr></thead>
 <tbody>{latest.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.sourceProvider}</td><td>{p.visibility}</td>
 <td>{p.releases[0]?.version ?? "—"}</td><td>{p.scans[0]?.status ?? "Not scanned"}</td>
 <td><a href={`/projects/${p.id}`}>Open</a></td></tr>)}</tbody></table></div></div></>;
}
