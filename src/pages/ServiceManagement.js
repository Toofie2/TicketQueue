import { useState } from "react";

const emptyForm = { event: "", venue: "", date: "", price: "", quantity: "" };

function ServiceManagement({ sales, setSales }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.event) return;
    if (editingId) {
      setSales(sales.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      setSales([...sales, { id: Date.now(), ...form }]);
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (sale) => {
    setEditingId(sale.id);
    setForm({
      event: sale.event,
      venue: sale.venue,
      date: sale.date,
      price: sale.price,
      quantity: sale.quantity,
    });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Service Management</h1>
        <p>Create and edit ticket sales</p>
      </header>

      <div className="admin-grid">
        <section className="panel">
          <h2>{editingId ? "Edit Ticket Sale" : "Create Ticket Sale"}</h2>
          <form className="sale-form" onSubmit={handleSubmit}>
            <label>
              Event Name
              <input
                name="event"
                value={form.event}
                onChange={handleChange}
                placeholder="e.g. Astros vs Yankees"
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
            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Save Changes" : "Create Sale"}
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
          <h2>Current Sales</h2>
          <ul className="item-list">
            {sales.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.event}</strong>
                  <span className="sale-meta">
                    {s.venue} · {s.date} · ${s.price} · {s.quantity} tickets
                  </span>
                </div>
                <button className="ghost-button" onClick={() => handleEdit(s)}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default ServiceManagement;
