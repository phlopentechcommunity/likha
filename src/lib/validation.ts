import { z } from "zod";
export const createProjectSchema = z.object({
  name: z.string().min(2).max(80).regex(/^[a-z0-9][a-z0-9-]*$/),
  sourceUrl: z.string().url(),
  sourceProvider: z.enum(["GITHUB","GITLAB","GITEA"]),
  sourceRef: z.string().min(1).max(128).default("main"),
  visibility: z.enum(["PUBLIC","PRIVATE"]).default("PRIVATE"),
  chartStrategy: z.enum(["AUTO","TEMPLATE","HYBRID"]).default("HYBRID"),
  templateKind: z.enum(["WEB","API","WORKER","CRONJOB","STATEFUL"]).default("WEB")
});
