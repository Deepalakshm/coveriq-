export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let id = localStorage.getItem('coveriq_user_id');
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('coveriq_user_id', id);
  }
  return id;
}