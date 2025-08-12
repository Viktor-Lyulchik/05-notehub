export interface Note {
  title: string;
  content: string;
  tag: NoteTag;
  id: string;
}

export type NoteTag = 'Todo' | 'Work' | 'Personal' | 'Meeting' | 'Shopping';

export type NoteId = Note['id'];

export type NotePost = Omit<Note, 'id'>;
