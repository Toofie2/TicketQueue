import { useState } from "react";

const emptyForm = {
  event: "",
  description: "",
  durationMinutes: "",
  priority: "medium",
  contactEmail: "",
  venue: "",
  date: "",
  price: "",
  quantity: "",
};

const today = new Date().toLocaleDateString("en-CA");

function ServiceManagement({ sales, setSales }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.event.trim()) return setError("Event Name is required.");
    if (form.event.length > 100)
      return setError("Event Name must be 100 characters or fewer.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.durationMinutes)
      return setError("Expected Duration is required.");
    if (Number(form.durationMinutes) <= 0)
      return setError("Expected Duration must be greater than 0.");
    if (form.date && form.date < today)
      return setError("Event date cannot be in the past.");
    if (
      form.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)
    )
      return setError("Please enter a valid contact email.");
    setError("");
    if (editingId) {
      setSales(sales.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      setSales([...sales, { id: Date.now(), queueOpen: true, ...form }]);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (sale) => {
    setEditingId(sale.id);
    setError("");
    setForm({
      event: sale.event,
      description: sale.description ?? "",
      durationMinutes: sale.durationMinutes ?? "",
      priority: sale.priority ?? "medium",
      contactEmail: sale.contactEmail ?? "",
      venue: sale.venue,
      date: sale.date,
      price: sale.price,
      quantity: sale.quantity,
    });
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

      <div className="admin-grid">
        <section className="panel">
          <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
          <form className="sale-form" onSubmit={handleSubmit}>
            <label>
              Event Name *
              <input
                name="event"
                value={form.event}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Astros vs Yankees"
              />
              <span className="field-hint">{form.event.length}/100</span>
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
                  name="durationMinutes"
                  value={form.durationMinutes}
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <label>
              Contact Email
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="organizer@example.com"
              />
            </label>
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
          <ul className="item-list item-list--light">
            {sales.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.event}</strong>
                  <span className="sale-meta">{s.description}</span>
                  <span className="sale-meta">
                    {[
                      s.durationMinutes ? `${s.durationMinutes} min` : null,
                      s.venue,
                      s.date,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="item-actions">
                  <span className={`priority-pill priority-${s.priority}`}>
                    {s.priority}
                  </span>
                  <button
                    className="ghost-button"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ServiceManagement;
