import type { OrgResource } from "@/types/permissions";
import { db } from "@/db";
import { requireEnv } from "./utils";

export const isOrgAdmin = (resource: OrgResource) => {
  const role = resource.organization?.members[0]?.role;
  return role === "admin" || role === "owner";
};

export const isOwnerOrOrgAdmin = (userId: string, resource: OrgResource) => {
  const isOwner = resource.authorId === userId;
  return isOwner || isOrgAdmin(resource);
};

export const isRootAdmin = async (userId: string) => {
  // Set root organization ID
  const rootOrgId = requireEnv("ROOT_ORGANIZATION_ID");

  const rootOrg = await db.query.organizations.findFirst({
    where: (org, { eq }) => eq(org.id, rootOrgId),
    with: {
      members: {
        where: (members, { eq }) => eq(members.userId, userId),
      },
    },
  });

  const role = rootOrg?.members[0]?.role;
  return role === "admin" || role === "owner";
};
