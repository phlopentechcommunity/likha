type DispatchInput = { owner:string; repo:string; workflow:string; ref:string; inputs:Record<string,string> };
export async function dispatchWorkflow(input: DispatchInput) {
  const token = process.env.GITHUB_API_TOKEN;
  if (!token) throw new Error("GITHUB_API_TOKEN is not configured");
  const url = `https://api.github.com/repos/${input.owner}/${input.repo}/actions/workflows/${input.workflow}/dispatches`;
  const response = await fetch(url, {
    method:"POST",
    headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},
    body:JSON.stringify({ref:input.ref,inputs:input.inputs})
  });
  if (!response.ok) throw new Error(`GitHub workflow dispatch failed: ${response.status} ${await response.text()}`);
}
