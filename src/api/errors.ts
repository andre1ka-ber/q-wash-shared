// Russian error-code -> message map, shared by every web app so each one
// doesn't reimplement it (see q-wash-shared/PLAN.md, "API client core").
// Grows as more of q-wash-api's error codes get exercised from the web apps;
// unmapped codes fall back to the server's own message.
const RU_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Неверный логин или пароль',
  forbidden: 'Недостаточно прав для этого действия',
  session_expired: 'Сессия истекла, войдите снова',
  network_error: 'Не удалось связаться с сервером',
  invalid_content_type: 'Разрешены только изображения JPEG, PNG, GIF или WebP',
  file_too_large: 'Файл слишком большой (максимум 10МБ)',
  invalid_file: 'Не удалось прочитать файл',
  invalid_hours: 'Проверьте время открытия и закрытия',
  invalid_break: 'Проверьте время перерыва',
  invalid_schedule: 'Не удалось сохранить расписание',
  cannot_unset_default: 'Сначала назначьте другой вариант цены основным',
  last_price_option: 'У услуги должен остаться хотя бы один вариант цены',
  price_option_in_use: 'Этот вариант цены уже используется в записях',
  multiple_default_price_options: 'Основным может быть только один вариант цены',
  cannot_pause: 'Поставить на паузу можно только во время мойки',
  cannot_resume: 'Эта запись сейчас не на паузе',
  cannot_cancel: 'Запись можно снять только до начала мойки',
  invalid_status_transition: 'Не удалось изменить статус записи',
  queue_not_found: 'Запись не найдена — возможно, её уже обработали',
  slot_unavailable: 'Это время уже занято — выберите другое',
  active_booking_exists: 'У клиента уже есть активная запись',
  phone_not_customer: 'Этот номер принадлежит сотруднику, а не клиенту',
  box_closed: 'Этот бокс сейчас закрыт',
  outside_operating_hours: 'Это время вне часов работы мойки',
  invalid_phone_number: 'Введите телефон, например 90 123 45 67 или +992901234567',
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
