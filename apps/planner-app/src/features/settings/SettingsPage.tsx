import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@app/shared';
import { useWorkspace } from '@/store/workspace';
import { useDeleteEvent, useUpdateEventInfo } from '@/lib/queries';
import { UNITS_PER_METRE, type EventSummary } from '@/domain/types';
import { Card, Page, Section } from '@/components/layout';
import { CommitInput, SettingRow } from '@/components/fields';
import { DeleteEventDialog } from '@/features/dashboard/DeleteEventDialog';

const m = (u: number) => String(Math.round((u / UNITS_PER_METRE) * 10) / 10);

export function SettingsPage() {
  const event = useWorkspace((s) => s.event)!;
  const details = useWorkspace((s) => s.details);
  const room = useWorkspace((s) => s.venue.room);
  const guestCount = useWorkspace((s) => s.guests.length);
  const updateDetails = useWorkspace((s) => s.updateDetails);
  const setRoom = useWorkspace((s) => s.setRoom);
  const rename = useUpdateEventInfo();
  const remove = useDeleteEvent();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const metres = (v: string) => {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) && n >= 2 && n <= 300 ? n * UNITS_PER_METRE : null;
  };

  return (
    <Page>
      <h1 className="text-[26px] font-semibold tracking-[-0.025em]">Settings</h1>

      <Section title="Event">
        <Card>
          <SettingRow label="Name" hint="Renaming also changes the guest page link.">
            <CommitInput value={event.name} onCommit={(name) => name.trim() && rename.mutate({ name: name.trim() })} />
          </SettingRow>
          <SettingRow label="Date and time">
            <div className="flex gap-2">
              <CommitInput type="date" value={details.date ?? ''} onCommit={(date) => updateDetails({ date: date || null })} />
              <CommitInput type="time" value={details.startTime ?? ''} onCommit={(startTime) => updateDetails({ startTime: startTime || null })} className="w-32" />
            </div>
          </SettingRow>
          <SettingRow label="Venue">
            <div className="flex flex-col gap-2">
              <CommitInput value={details.venueName ?? ''} placeholder="Venue name" onCommit={(venueName) => updateDetails({ venueName })} />
              <CommitInput value={details.address ?? ''} placeholder="Address" onCommit={(address) => updateDetails({ address })} />
            </div>
          </SettingRow>
          <SettingRow label="Room size" hint="Used by the floor plan and the 3D view.">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <CommitInput value={m(room.width)} inputMode="decimal" className="w-20 tabular" onCommit={(v) => { const w = metres(v); if (w) setRoom({ ...room, width: w }); }} />
              ×
              <CommitInput value={m(room.depth)} inputMode="decimal" className="w-20 tabular" onCommit={(v) => { const d = metres(v); if (d) setRoom({ ...room, depth: d }); }} />
              m
            </div>
          </SettingRow>
        </Card>
      </Section>

      <Section title="Guest page">
        <Card>
          <SettingRow label="Welcome message" hint="Shown to guests after they find their seat.">
            <CommitInput multiline value={details.welcomeMessage ?? ''} placeholder="Thank you for celebrating with us…" onCommit={(welcomeMessage) => updateDetails({ welcomeMessage })} />
          </SettingRow>
          <SettingRow label="RSVP deadline">
            <CommitInput type="date" value={details.rsvpDeadline ?? ''} onCommit={(rsvpDeadline) => updateDetails({ rsvpDeadline: rsvpDeadline || null })} className="w-44" />
          </SettingRow>
          <SettingRow label="Contact email" hint="For guests with questions on the day.">
            <CommitInput type="email" value={details.contactEmail ?? ''} placeholder="you@example.com" onCommit={(contactEmail) => updateDetails({ contactEmail })} />
          </SettingRow>
        </Card>
      </Section>

      <Section title="Danger zone">
        <Card className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium">Delete this event</span>
            <span className="text-[12.5px] text-muted-foreground">Removes the floor plan, all {guestCount} guests and the guest page.</span>
          </div>
          <Button variant="destructive" onClick={() => setDeleting(true)}>
            Delete event
          </Button>
        </Card>
      </Section>

      <DeleteEventDialog
        event={deleting ? ({ ...event, guests: Array(guestCount) } as unknown as EventSummary) : null}
        onClose={() => setDeleting(false)}
        onConfirm={() => {
          remove.mutate(event.slug, { onSuccess: () => useWorkspace.getState().clear() });
          setDeleting(false);
          navigate('/');
        }}
      />
    </Page>
  );
}
