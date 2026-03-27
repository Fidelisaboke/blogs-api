export type OrgRole = "admin" | "owner" | "member" | "viewer";

export interface OrgResource {
  authorId?: string | null;
  organization?: {
    members: { role: OrgRole }[];
  } | null;
}
