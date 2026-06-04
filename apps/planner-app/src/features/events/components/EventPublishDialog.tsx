import { Dialog, DialogContent } from '@/components/ui/dialog';
import { buildEventPayload } from '@/lib/buildEventPayload';
import { IconButton } from '@/shared/components';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { StateContainer } from './PublishStateContainer';
import { Progress } from '@/components/ui/progress';
import { useEventStore } from '@/store/useEventStore';

type Event = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type PublishState =
  | { status: 'idle' }
  | { status: 'building' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; event: Event }
  | { status: 'error' };

export const EventPublishDialog = () => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [publishState, setPublishState] = useState<PublishState>({
    status: 'idle',
  });

  const activeEvent = useEventStore((s) => s.activeEvent);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Smooth suspense progress animation
useEffect(() => {
  if (publishState.status !== 'building') return;

  let value = 0;

  const interval = setInterval(() => {
    value += Math.random() * 8;

    if (value >= 92) value = 92;

    setProgress(value);
  }, 120);

  return () => clearInterval(interval);
}, [publishState.status]);

  const PublishEvent = async () => {
    try {
      setPublishState({ status: 'building' });

      await wait(2200);

      const payload = buildEventPayload();

      console.log('Frontend Payload:', payload);
      
      setProgress(100); 
      await wait(500);

      setPublishState({ status: 'uploading', progress: 0 });

      const res = await axios.post<Event>(
        'http://localhost:3001/events',
        payload,
        {
          onUploadProgress(progressEvent) {
            const total = progressEvent.total ?? 1;

            const percent = Math.round(
              (progressEvent.loaded * 100) / total
            );

            setPublishState((prev) =>
              prev.status === 'uploading'
                ? { ...prev, progress: percent }
                : prev
            );
          },
        }
      );

      await wait(400);

      setPublishState({
        status: 'success',
        event: res.data,
      });
    } catch (error) {
      console.error('Failed to publish event', error);
      setPublishState({ status: 'error' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <IconButton
        Label="Publish Event"
        onClick={() => setOpen(true)}
      />

      <DialogContent className="w-full min-w-lg">
        {publishState.status === 'idle' && (
          <StateContainer
            title="Publish Event"
            description="Your event data will be packed and uploaded"
          >
            <IconButton
              Label={
                activeEvent
                  ? `Publish ${activeEvent.name}`
                  : 'Publish Event'
              }
              onClick={PublishEvent}
            />
          </StateContainer>
        )}

        {publishState.status === 'building' && (
          <StateContainer
            title="Building Event QR Code"
            description="Building seating layouts..."
          >
            <Progress value={progress} className="h-3 w-20" />
          </StateContainer>
        )}

        {publishState.status === 'uploading' && (
          <StateContainer
            title="Publishing Event"
            description="Uploading event payload..."
          >
            <Progress value={publishState.progress} />
          </StateContainer>
        )}

        {publishState.status === 'success' && (
          <StateContainer
            title={`${publishState.event.name} Event Published`}
            description="Your event has been published successfully."
          >
            <p className="text-sm text-muted-foreground">
              Event ID: {publishState.event.id}
            </p>
            <p className="text-sm text-muted-foreground">
              Slug: {publishState.event.slug}
            </p>
          </StateContainer>
        )}

        {publishState.status === 'error' && (
          <StateContainer
            title="Publish Failed"
            description="Something went wrong while publishing."
          />
        )}
      </DialogContent>
    </Dialog>
  );
};