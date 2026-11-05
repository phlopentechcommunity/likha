import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {createProjectSchema} from "@/lib/validation";
export async function GET(){const projects=await prisma.project.findMany({orderBy:{createdAt:"desc"}});return NextResponse.json(projects);}
export async function POST(req:Request){try{const parsed=createProjectSchema.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
const p=await prisma.project.create({data:parsed.data});return NextResponse.json(p,{status:201});}
catch{return NextResponse.json({error:"Unable to create project"},{status:500});}}
