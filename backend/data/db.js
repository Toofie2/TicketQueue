import events from './events.js';

const PRIORITY_CYCLE = ['High', 'Medium', 'Low'];
const DURATION_CYCLE = [90, 120, 150, 180];

const MONTHS = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

const toISODate = (human) => {
  const match = /^(\w+)\s+(\d{1,2}),\s*(\d{4})$/.exec(human);
  if (!match) return human;
  const [, month, day, year] = match;
  return `${year}-${MONTHS[month]}-${String(day).padStart(2, '0')}`;
};

const buildServices = () =>
  events.map((event, index) => ({
    id: event.id,
    name: event.title,
    description: `${event.category} — live at ${event.location}.`,
    expectedDuration: DURATION_CYCLE[index % DURATION_CYCLE.length],
    priority: PRIORITY_CYCLE[index % PRIORITY_CYCLE.length],
    venue: event.location,
    category: event.category,
    time: event.time,
    date: toISODate(event.date),
    price: event.price,
    quantity: 500,
  }));

export const db = {
  services: buildServices(),
  queue: [],
  notifications: [],
};

export const resetDb = () => {
  db.services = buildServices();
  db.queue = [];
  db.notifications = [];
};

export default db;
