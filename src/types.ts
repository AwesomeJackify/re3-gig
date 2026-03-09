
export interface Task {
  id: string;
  name: string;
  user_id: string;
  is_complete: boolean;
  created_at: string;
}

export interface Journal {
  id: string;
  user_id: string;
  journal_entry: string;
  created_at: string;
}

export interface BigGoals {
  id: string;
  user_id: string;
  big_goals: string;
  created_at: string;
}
