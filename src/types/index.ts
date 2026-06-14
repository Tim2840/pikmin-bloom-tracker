export type ItemType = 'postcard' | 'mushroom';
export type ActionType = 'sent' | 'received' | 'helped';

export interface Person {
  id: string;
  name: string;
  nickname?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

export interface RecordItem {
  id: string;
  personId: string | null;
  personNameSnapshot: string;
  date: string; // YYYY-MM-DD
  itemType: ItemType;
  actionType: ActionType;
  note?: string;
  createdAt: string;
}

export interface QuickAction {
  id: string;
  label: string;
  personId: string;
  itemType: ItemType;
  actionType: ActionType;
  useToday: boolean;
  sortOrder: number;
  createdAt: string;
}
