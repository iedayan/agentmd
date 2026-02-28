export function getClientKey(request: Request): string {
  const userId = request.headers.get('x-user-id')?.trim();
  if (userId) return `user:${userId}`;

  const apiKey = request.headers.get('x-api-key')?.trim();
  if (apiKey) return `api:${apiKey.slice(0, 32)}`;

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return `ip:${forwarded}`;

  return 'anonymous';
}
