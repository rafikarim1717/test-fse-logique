export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
}

export interface GroupTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: GroupTreeNode[];
}

export interface Credential {
  id: number;
  title: string;
  username: string;
  url: string | null;
  notes: string | null;
  categoryId: number;
  groupId: number;
  category?: { id: number; name: string };
  group?: { id: number; name: string };
  createdAt: string;
}