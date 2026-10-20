import sql from '@/lib/db/client';
import { sendOperationalAlertEmail } from '@/lib/email/email-service';

type OperationalEventInput = {
  source: string;
  eventKey?: string;
  message: string;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

export async function reportOperationalError(input: OperationalEventInput) {
  const errorMessage = input.error instanceof Error ? input.error.message : String(input.error || 'Unknown error');
  const rows = await sql`
    INSERT INTO operational_events (severity, event_key, source, message, metadata)
    VALUES (
      'error',
      ${input.eventKey ?? null},
      ${input.source},
      ${input.message},
      ${JSON.stringify({ ...input.metadata, error: errorMessage.slice(0, 1000) })}::jsonb
    )
    ON CONFLICT (event_key) DO UPDATE SET
      message = EXCLUDED.message,
      metadata = EXCLUDED.metadata
    RETURNING id, created_at
  `;
  const event = rows[0] as { id: number; created_at: string };

  try {
    await sendOperationalAlertEmail({
      eventId: event.id,
      source: input.source,
      message: input.message,
      occurredAt: event.created_at
    });
  } catch (alertError) {
    console.error('Operational event recorded, but its alert email failed:', alertError);
  }

  return event;
}
