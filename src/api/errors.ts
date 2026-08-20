// Russian error-code -> message map, shared by every web app so each one
// doesn't reimplement it (see q-wash-shared/PLAN.md, "API client core").
// Grows as more of q-wash-api's error codes get exercised from the web apps;
// unmapped codes fall back to the server's own message.
const RU_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Неверный логин или пароль',
  forbidden: 'Недостаточно прав для этого действия',
  session_expired: 'Сессия истекла, войдите снова',
  network_error: 'Не удалось связаться с сервером',
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function messageForCode(code: string, fallback: string): string {
  return RU_ERROR_MESSAGES[code] ?? fallback;
}
