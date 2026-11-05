import json, os, urllib.request, collections
from pathlib import Path

project_id=os.environ["PROJECT_ID"]
image=os.environ.get("IMAGE","")
commit=os.environ["COMMIT"]
callback=os.environ["CALLBACK_URL"]
token=os.environ["CALLBACK_TOKEN"]
report=json.loads(Path("trivy-image.json").read_text())
counts=collections.Counter()
vulns=[]
for result in report.get("Results",[]):
    for v in result.get("Vulnerabilities") or []:
        sev=(v.get("Severity") or "UNKNOWN").upper()
        if sev not in {"CRITICAL","HIGH","MEDIUM","LOW"}: sev="UNKNOWN"
        counts[sev]+=1
        vulns.append({"id":v.get("VulnerabilityID","UNKNOWN"),
          "packageName":v.get("PkgName","unknown"),
          "installedVersion":v.get("InstalledVersion","unknown"),
          "fixedVersion":v.get("FixedVersion") or None,"severity":sev,
          "primaryUrl":v.get("PrimaryURL") or None})
config=json.loads(Path("trivy-config.json").read_text()) if Path("trivy-config.json").exists() else {}
crit=counts["CRITICAL"]; high=counts["HIGH"]
status="FAILED" if crit else ("WARNING" if high else "PASSED")
payload={"projectId":project_id,"commitSha":commit,"imageRef":image+":"+commit,
 "imageDigest":"unknown","chartRef":"pending","chartVersion":"0.1.0",
 "scanStatus":status,"criticalCount":crit,"highCount":high,
 "mediumCount":counts["MEDIUM"],"lowCount":counts["LOW"],
 "scannerVersion":report.get("Metadata",{}).get("Version","trivy"),
 "vulnerabilities":vulns}
req=urllib.request.Request(callback,data=json.dumps(payload).encode(),
 headers={"Content-Type":"application/json","Authorization":"Bearer "+token},method="POST")
with urllib.request.urlopen(req,timeout=20) as response:
 print(response.status,response.read().decode())
