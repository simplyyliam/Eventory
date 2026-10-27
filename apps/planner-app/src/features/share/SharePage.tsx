import { useEffect, useMemo, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, ExternalLink, Printer } from 'lucide-react';
import { Button, cn } from '@app/shared';
import { useWorkspace } from '@/store/workspace';
import { useUpdateEventInfo } from '@/lib/queries';
import { flushSave } from '@/store/autosave';
import { guestPageUrl } from '@/lib/api';
import { seatNumber } from '@/domain/geometry';
import { Card, Page, Section } from '@/components/layout';
import { CopyButton } from '@/components/CopyButton';
import { Switch } from '@/components/fields';
import { Pill } from '@/components/StatusPill';
import { PrintSheet } from './PrintSheet';

function useQr(value: string) {
  return useMemo(
    () =>
      new QRCodeStyling({
        width: 640,
        height: 640,
        data: value,
        margin: 16,
        dotsOptions: { color: '#111111', type: 'rounded' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#111111' },
        cornersDotOptions: { type: 'dot', color: '#111111' },
        backgroundOptions: { color: '#ffffff' },
      }),
    [value],
  );
}

function QrPreview({ qr, live }: { qr: QRCodeStyling; live: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    qr.append(ref.current);
    const canvas = ref.current.querySelector('canvas, svg') as HTMLElement | null;
    if (canvas) canvas.style.cssText = 'width:100%;height:100%';
  }, [qr]);
  return (
    <div className="relative size-44 shrink-0 overflow-hidden rounded-xl border border-hairline bg-white p-2">
      <div ref={ref} className={cn('size-full transition-[filter,opacity] duration-300', !live && 'opacity-40 blur-[3px]')} />
      {!live && <span className="absolute inset-0 grid place-items-center text-[12px] font-medium text-neutral-600">Publish to activate</span>}
    </div>
  );
}

export function SharePage() {
  const event = useWorkspace((s) => s.event)!;
  const guests = useWorkspace((s) => s.guests);
  const tables = useWorkspace((s) => s.tables);
  const update = useUpdateEventInfo();
  const live = event.status === 'published';
  const url = guestPageUrl(event.slug);
  const qr = useQr(url);
  const seated = guests.filter((g) => g.seat).length;

  const setLive = async (v: boolean) => {
    await flushSave();
    update.mutate({ status: v ? 'published' : 'draft' });
  };

  return (
    <Page>
      <h1 className="text-[26px] font-semibold tracking-[-0.025em]">Share</h1>

      <Section title="Guest page">
        <Card>
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 text-[13px] font-medium">
                Publish guest page
                {live ? <Pill tone="info">Live</Pill> : <Pill>Draft</Pill>}
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                Guests search their name and see their table, seat and who they’re sitting with. Changes you make go live straight away.
              </span>
            </div>
            <Switch checked={live} onChange={setLive} label="Publish guest page" />
          </div>
          <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center">
            <QrPreview qr={qr} live={live} />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-muted-foreground">Link</span>
                <div className="flex h-8 items-center rounded-lg border border-hairline bg-canvas px-2.5 font-mono text-[12px] text-muted-foreground">
                  <span className="truncate">{url}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={url} />
                <Button variant="outline" onClick={() => qr.download({ name: `${event.slug}-qr`, extension: 'png' })} disabled={!live}>
                  <Download className="size-4" />
                  QR code
                </Button>
                <Button variant="ghost" nativeButton={false} render={<a href={url} target="_blank" rel="noreferrer" />} disabled={!live}>
                  <ExternalLink className="size-4" />
                  Open
                </Button>
              </div>
              <p className="text-[12px] text-muted-foreground">Print the QR code on place cards, the welcome sign, or the invitation.</p>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Print">
        <Card className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium">Seating chart</span>
            <span className="text-[12.5px] text-muted-foreground">
              An A–Z list of {seated} seated guests with table and seat, plus a page per table for the venue team.
            </span>
          </div>
          <Button variant="outline" onClick={() => window.print()} disabled={seated === 0}>
            <Printer className="size-4" />
            Print
          </Button>
        </Card>
      </Section>

      <PrintSheet name={event.name} guests={guests} tables={tables} seatNumber={seatNumber} />
    </Page>
  );
}
