import { useState } from "react";

const columns = [
  { key: "position", label: "#" },
  { key: "name", label: "User" },
  { key: "tickets", label: "Tickets" },
  { key: "waitMinutes", label: "Wait" },
];

function QueueTable({ queue, onKick }) {
  const [sortKey, setSortKey] = useState("position");
  const [asc, setAsc] = useState(true);

  const handleSort = (key) => {
    if (key === sortKey) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const withPosition = queue.map((u, i) => ({ ...u, position: i + 1 }));

  const sorted = [...withPosition].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string") {
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return asc ? av - bv : bv - av;
  });

  return (
    <table className="queue-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} onClick={() => handleSort(col.key)}>
              {col.label}
              {sortKey === col.key && <span>{asc ? " ▲" : " ▼"}</span>}
            </th>
          ))}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((user) => (
          <tr key={user.id}>
            <td>{user.position}</td>
            <td>{user.name}</td>
            <td>{user.tickets}</td>
            <td>{user.waitMinutes} min</td>
            <td>
              <button className="kick-button" onClick={() => onKick(user.id)}>
                Kick
              </button>
            </td>
          </tr>
        ))}
        {sorted.length === 0 && (
          <tr>
            <td colSpan={5} className="queue-empty">
              The queue is empty.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default QueueTable;
