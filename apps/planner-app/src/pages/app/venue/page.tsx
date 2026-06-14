import { PageContainer } from '@/shared/components';
import { useEventStore } from '@/store/useEventStore';
import { useGuestStore } from '@/store/useGuestStore';
import { useTableStore } from '@/store/useTableStore';
import { Table } from '../../../features/venue/components/table/Table';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { World } from './world';
import axios from 'axios';
import { API_BASE_URL } from '@app/shared/utils/api';
import { loadEvent } from '@/service/eventService';
import { useAutoSaveEvent } from '@/lib/useAutoSaveEvent';
import { useHistoryStore } from '@/store/useHistorySnapshot';

type Viewport = {
  x: number;
  y: number;
  scale: number;
};

export default function VenuePage() {
  const navigate = useNavigate();
  const { eventSlug } = useParams();
  
  useAutoSaveEvent(eventSlug)

  const openEvent = useEventStore((s) => s.openEvent);
  const setActiveGuestEvent = useGuestStore((s) => s.setActiveEvent);
  const setActiveTableEvent = useTableStore((s) => s.setActiveEvent);
  const setActiveEvent = useEventStore((s) => s.setActiveEvent);

  const tables = useTableStore((s) => s.tables);

  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const isPanning = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!eventSlug) return;

    const localEvent = openEvent(eventSlug);

    if (localEvent) {
      setActiveGuestEvent(localEvent.id);
      setActiveTableEvent(localEvent.id);

      useHistoryStore.getState().init()
      
      return;
    }

    axios
      .get(`${API_BASE_URL}/internal/events/${eventSlug}`)
      .then((res) => {
        const event = res.data;

        setActiveEvent(event);
        setActiveGuestEvent(event.id);
        setActiveTableEvent(event.id);

        // hydrate stores
        loadEvent(eventSlug);

        useHistoryStore.getState().init()
      })
      .catch(() => {
        navigate('/', { replace: true });
      });
  }, [eventSlug]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!isPanning.current) return;

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;

      last.current = { x: e.clientX, y: e.clientY };

      setViewport((v) => ({
        ...v,
        x: v.x + dx,
        y: v.y + dy,
      }));
    };

    const up = () => {
      isPanning.current = false;
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const delta = -e.deltaY;
    const zoomFactor = 1 + delta * 0.0015;

    setViewport((prev) => {
      const minScale = 0.2;
      const maxScale = 4;

      const oldScale = prev.scale;
      let newScale = oldScale * zoomFactor;

      if (newScale < minScale) newScale = minScale;
      if (newScale > maxScale) newScale = maxScale;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      const pointerX = e.clientX - cx;
      const pointerY = e.clientY - cy;

      const worldX = (pointerX - prev.x) / oldScale;
      const worldY = (pointerY - prev.y) / oldScale;

      const newX = pointerX - worldX * newScale;
      const newY = pointerY - worldY * newScale;

      return {
        x: newX,
        y: newY,
        scale: newScale,
      };
    });
  };

  return (
    <PageContainer
      onPointerDown={(e) => {
        isPanning.current = true;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden"
    >
      <World viewport={viewport}>
        {tables.map((table) => (
          <Table
            key={table.id}
            id={table.id}
            name={table.name}
            shape={table.shape}
            seatCount={table.seatCount}
            tableId={table.id}
            x={table.x}
            y={table.y}
            rotation={table.rotation}
          />
        ))}
      </World>
    </PageContainer>
  );
}