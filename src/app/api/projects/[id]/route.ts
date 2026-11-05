import {NextResponse} from "next/server";import {prisma} from "@/lib/prisma";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;
const p=await prisma.project.findUnique({where:{id},include:{releases:true,scans:{include:{vulnerabilities:true}}}});
return p?NextResponse.json(p):NextResponse.json({error:"Not found"},{status:404});}
