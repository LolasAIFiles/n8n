type LogLevel = 'info' | 'warn' | 'error';

const redact = (value: unknown) => JSON.parse(JSON.stringify(value, (_k, v) => {
  if (typeof v !== 'string') return v;
  if (v.length > 500) return `${v.slice(0, 500)}...[truncated]`;
  if (v.startsWith('Bearer ')) return 'Bearer [redacted]';
  return v;
}));

const emit = (level: LogLevel, event: string, payload: Record<string, unknown>) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...redact(payload),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
    return;
  }
  console.log(line);
};

export const logEvent = (event: string, payload: Record<string, unknown>) => emit('info', event, payload);
export const logWarn = (event: string, payload: Record<string, unknown>) => emit('warn', event, payload);
export const logError = (event: string, payload: Record<string, unknown>) => emit('error', event, payload);
