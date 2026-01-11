import { useUser, UserRole } from "@/contexts/UserContext";

const adminRoles = ["admin", "super_admin"] as const;

const permissions = {
  orders: {
    canChangeStatus: adminRoles,
    canPrint: adminRoles,
  },
  categories: {
    canCreate: adminRoles,
    canDelete: adminRoles,
    canEdit: adminRoles,
    canTogglePublished: adminRoles,
  },
  coupons: {
    canCreate: adminRoles,
    canDelete: adminRoles,
    canEdit: adminRoles,
    canTogglePublished: adminRoles,
  },
  customers: {
    canDelete: adminRoles,
    canEdit: adminRoles,
  },
  products: {
    canCreate: adminRoles,
    canDelete: adminRoles,
    canEdit: adminRoles,
    canTogglePublished: adminRoles,
  },
  staff: {
    canDelete: adminRoles,
    canEdit: adminRoles,
    canTogglePublished: adminRoles,
  },
} as const;

type PermissionMap = typeof permissions;
type Feature = keyof PermissionMap;

export function useAuthorization() {
  const { user, profile, isLoading } = useUser();

  const hasPermission = <F extends Feature>(
    feature: F,
    action: keyof PermissionMap[F]
  ): boolean => {
    if (isLoading || !profile || !profile.role) return false;

    const allowedRoles = permissions[feature][action] as readonly string[];
    return allowedRoles.includes(profile.role);
  };

  const isSelf = (staffId: string) => {
    return user?.id === staffId;
  };

  return { hasPermission, isSelf, isLoading };
}

export type HasPermission = ReturnType<
  typeof useAuthorization
>["hasPermission"];
export type IsSelf = ReturnType<typeof useAuthorization>["isSelf"];
