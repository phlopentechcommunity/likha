import {NextResponse} from "next/server";import {prisma} from "@/lib/prisma";import {dispatchWorkflow} from "@/lib/github";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const p=await prisma.project.findUnique({where:{id}});
if(!p)return NextResponse.json({error:"Project not found"},{status:404});
const owner=process.env.GITHUB_OWNER!,repo=process.env.GITHUB_WORKFLOW_REPO!,workflow=process.env.GITHUB_WORKFLOW_FILE??"project-build.yaml";
await dispatchWorkflow({owner,repo,workflow,ref:process.env.GITHUB_DEFAULT_REF??"main",inputs:{
project_id:p.id,source_url:p.sourceUrl,source_ref:p.sourceRef,project_name:p.name,
visibility:p.visibility.toLowerCase(),template_kind:p.templateKind.toLowerCase(),
callback_url:`${process.env.LIKHA_PUBLIC_URL}/api/internal/scan-results`}});
await prisma.build.create({data:{projectId:p.id,status:"DISPATCHED",provider:"GITHUB_ACTIONS"}});
return NextResponse.json({status:"DISPATCHED"});}
catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Dispatch failed"},{status:502});}}
