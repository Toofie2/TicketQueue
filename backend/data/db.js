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
    queueOpen: true,
  }));

const MOCK_PEOPLE = [
  { name: 'Ava Martinez', priority: 'High' },
  { name: 'Liam Chen', priority: 'Medium' },
  { name: 'Noah Patel', priority: 'Low' },
  { name: 'Sofia Reyes', priority: 'Medium' },
  { name: 'Ethan Brooks', priority: 'High' },
];

const MOCK_COUNTS = [2, 4, 1, 3, 2, 4, 5, 2, 1, 3, 3, 3, 2];

const buildQueue = () =>
  buildServices().flatMap((service, index) => {
    const count = MOCK_COUNTS[index] ?? 3;
    return MOCK_PEOPLE.slice(0, count).map((person, i) => ({
      userId: `mock-${service.id}-${i}`,
      email: `mock-${service.id}-${i}@demo.com`,
      serviceId: service.name,
      name: person.name,
      priority: person.priority,
      joinedAt: new Date(Date.now() + i),
    }));
  });

export const db = {
  services: buildServices(),
  queue: buildQueue(),
  notifications: [],
};

export const resetDb = () => {
  db.services = buildServices();
  db.queue = buildQueue();
  db.notifications = [];
};

export default db;
