import { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

const emptyForm = {
  name: "",
  description: "",
  expectedDuration: "",
  priority: "Medium",
  venue: "",
  category: "Sports",
  time: "",
  date: "",
  price: "",
  quantity: "",
};

const CATEGORIES = ["Sports", "Music", "Comedy", "Other"];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h24 = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const period = h24 >= 12 ? "PM" : "AM";
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${hour}:${minutes} ${period}`;
});

const today = new Date().toLocaleDateString("en-CA");

function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setApiError(
          "Could not load services."
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Event Name is required.");
    if (form.name.length > 100)
      return setError("Event Name must be 100 characters or fewer.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.expectedDuration)
      return setError("Expected Duration is required.");
    if (Number(form.expectedDuration) <= 0)
      return setError("Expected Duration must be greater than 0.");
    if (form.date && form.date < today)
      return setError("Event date cannot be in the past.");
    setError("");

    try {
      const url = editingId
        ? `${API_BASE}/api/services/${editingId}`
        : `${API_BASE}/api/services`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");

      if (editingId) {
        setServices((prev) => prev.map((s) => (s.id === editingId ? data : s)));
      } else {
        setServices((prev) => [...prev, data]);
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError("Could not reach the server.");
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setError("");
    setForm({
      name: service.name,
      description: service.description ?? "",
      expectedDuration: service.expectedDuration ?? "",
      priority: service.priority ?? "Medium",
      venue: service.venue ?? "",
      category: service.category ?? "Sports",
      time: service.time ?? "",
      date: service.date ?? "",
      price: service.price ?? "",
      quantity: service.quantity ?? "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) handleCancel();
    } catch (err) {
      setApiError("Could not reach the server to delete.");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Event Management</h1>
        <p>Create and edit events</p>
      </header>

      {apiError && <p className="form-error">{apiError}</p>}

      <div className="admin-grid">
        <section className="panel">
          <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
          <form className="sale-form" onSubmit={handleSubmit}>
            <label>
              Event Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Astros vs Yankees"
              />
              <span className="field-hint">{form.name.length}/100</span>
            </label>
            <label>
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="What is this event?"
              />
            </label>
            <div className="form-row">
              <label>
                Expected Duration (min) *
                <input
                  type="number"
                  name="expectedDuration"
                  value={form.expectedDuration}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                />
              </label>
              <label>
                Priority Level
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>
            <label>
              Venue
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. Minute Maid Park"
              />
            </label>
            <div className="form-row">
              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time
                <select name="time" value={form.time} onChange={handleChange}>
                  <option value="">Select a time</option>
                  {form.time && !TIME_SLOTS.includes(form.time) && (
                    <option value={form.time}>{form.time}</option>
                  )}
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                />
              </label>
              <label>
                Price ($)
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="45"
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="500"
                />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Save Changes" : "Create Event"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <h2>Current Events</h2>
          {loading ? (
            <p className="sale-meta">Loading events…</p>
          ) : (
            <ul className="item-list item-list--light">
              {services.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.name}</strong>
                    <span className="sale-meta">{s.description}</span>
                    <span className="sale-meta">
                      {[
                        s.expectedDuration ? `${s.expectedDuration} min` : null,
                        s.venue,
                        s.date,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <div className="item-actions">
                    <span
                      className={`priority-pill priority-${String(
                        s.priority
                      ).toLowerCase()}`}
                    >
                      {s.priority}
                    </span>
                    <button
                      className="ghost-button"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="kick-button"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default ServiceManagement;
