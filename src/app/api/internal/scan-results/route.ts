import {NextResponse} from "next/server";import {prisma} from "@/lib/prisma";import {requireInternalToken} from "@/lib/auth";import {z} from "zod";
const schema=z.object({projectId:z.string(),commitSha:z.string(),imageRef:z.string(),imageDigest:z.string(),chartRef:z.string(),chartVersion:z.string(),
scanStatus:z.enum(["PASSED","WARNING","FAILED"]),criticalCount:z.number().int().nonnegative(),highCount:z.number().int().nonnegative(),
mediumCount:z.number().int().nonnegative(),lowCount:z.number().int().nonnegative(),scannerVersion:z.string(),vulnerabilities:z.array(z.object({
id:z.string(),packageName:z.string(),installedVersion:z.string(),fixedVersion:z.string().optional(),severity:z.enum(["CRITICAL","HIGH","MEDIUM","LOW","UNKNOWN"]),primaryUrl:z.string().optional()
})).default([])});
export async function POST(req:Request){if(!requireInternalToken(req))return NextResponse.json({error:"Unauthorized"},{status:401});
const parsed=schema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
const d=parsed.data;const project=await prisma.project.findUnique({where:{id:d.projectId}});if(!project)return NextResponse.json({error:"Unknown project"},{status:404});
const result=await prisma.$transaction(async tx=>{const release=await tx.release.create({data:{projectId:d.projectId,version:d.chartVersion,imageRef:d.imageRef,imageDigest:d.imageDigest,chartRef:d.chartRef,commitSha:d.commitSha}});
const scan=await tx.securityScan.create({data:{projectId:d.projectId,releaseId:release.id,status:d.scanStatus,criticalCount:d.criticalCount,highCount:d.highCount,mediumCount:d.mediumCount,lowCount:d.lowCount,scannerVersion:d.scannerVersion,
vulnerabilities:{create:d.vulnerabilities.map(v=>({cveId:v.id,packageName:v.packageName,installedVersion:v.installedVersion,
fixedVersion:v.fixedVersion??null,severity:v.severity,primaryUrl:v.primaryUrl??null}))}}});
return {release,scan};});return NextResponse.json(result,{status:201});}
