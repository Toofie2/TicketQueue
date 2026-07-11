import { useState } from "react";
import QueueTable from "../components/QueueTable";

function QueueManagement({ sales, queue, setQueue }) {
  const [selectedEventId, setSelectedEventId] = useState(sales[0]?.id ?? null);

  const eventQueue = queue.filter((u) => u.eventId === selectedEventId);

  const kickUser = (id) => setQueue(queue.filter((u) => u.id !== id));

  const moveUser = (id, dir) => {
    const ids = eventQueue.map((u) => u.id);
    const idx = ids.indexOf(id);
    const target = idx + dir;
    if (target < 0 || target >= ids.length) return;
    const next = [...queue];
    const gi = next.findIndex((u) => u.id === ids[idx]);
    const gj = next.findIndex((u) => u.id === ids[target]);
    const a = next[gi];
    const b = next[gj];
    next[gi] = { ...b, waitMinutes: a.waitMinutes };
    next[gj] = { ...a, waitMinutes: b.waitMinutes };
    setQueue(next);
  };

  const advanceQueue = () => {
    const front = eventQueue[0];
    if (front) setQueue(queue.filter((u) => u.id !== front.id));
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Queue Management</h1>
        <p>Pick an event to manage the queue</p>
      </header>

      <div className="event-tabs">
        {sales.map((s) => {
          const count = queue.filter((u) => u.eventId === s.id).length;
          return (
            <button
              key={s.id}
              className={`event-tab ${
                s.id === selectedEventId ? "event-tab-active" : ""
              }`}
              onClick={() => setSelectedEventId(s.id)}
            >
              {s.event}
              <span className="event-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Live Queue ({eventQueue.length})</h2>
          <button
            className="primary-button"
            onClick={advanceQueue}
            disabled={eventQueue.length === 0}
          >
            Advance Queue
          </button>
        </div>
        <QueueTable queue={eventQueue} onKick={kickUser} onMove={moveUser} />
      </section>
    </div>
  );
}

export default QueueManagement;
