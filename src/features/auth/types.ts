export interface CurrentUser {
  user_id: number;
  user_name: string;
  nick_name: string;
  email: string;
  phone_number: string;
  sex: string;
  avatar: string;
  user_type: string;
  credential_type: 'web' | 'desktop_app';
}

export interface AuthRoute {
  id: number;
  parent_id?: number | null;
  name: string;
  path: string;
  hidden: boolean;
  menu_type: string;
  meta: {
    title: string;
    icon: string;
  };
  children?: AuthRoute[];
}

export interface AuthPermissions {
  roles: string[];
  is_super_admin: boolean;
  global_roles: AuthGlobalRole[];
  global_permissions: string[];
  global_buttons: string[];
  team_permissions: AuthTeamPermissions;
  routes: AuthRoute[];
}

export type AuthTeamPermissions = string[] | AuthTeamPermissionEntry[];

export interface AuthGlobalRole {
  role_id: number;
  role_key: string;
  role_name: string;
  permissions: string[];
}

export interface AuthTeamPermissionEntry {
  team_id: number;
  permissions: string[];
  menus: string[];
  buttons: string[];
}

export interface TeamInvite {
  invite_id: number;
  invite_token: string;
  team_id: number;
  team_key: string;
  team_name: string;
  inviter_user_id: number;
  inviter_name: string;
  email?: string | null;
  role_key?: string | null;
  role_name?: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  expires_at: string;
}
