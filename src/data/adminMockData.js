export const mockRevenue = 48250;

export const initialSales = [
  {
    id: 1,
    event: "Houston Rockets vs Dallas Mavericks",
    description: "NBA regular season home game with premium seating.",
    durationMinutes: 150,
    priority: "high",
    queueOpen: true,
    venue: "Toyota Center",
    date: "2026-08-12",
    price: 45,
    quantity: 500,
  },
  {
    id: 2,
    event: "Summer Music Festival",
    description: "Outdoor all-day festival featuring multiple live acts.",
    durationMinutes: 480,
    priority: "medium",
    queueOpen: true,
    venue: "Discovery Green",
    date: "2026-08-20",
    price: 60,
    quantity: 1200,
  },
  {
    id: 3,
    event: "Comedy Night Live",
    description: "Stand-up comedy showcase with headline performers.",
    durationMinutes: 120,
    priority: "low",
    queueOpen: false,
    venue: "House of Blues Houston",
    date: "2026-09-05",
    price: 35,
    quantity: 300,
  },
];

export const initialQueue = [
  { id: 101, name: "Maria Lopez", eventId: 1, tickets: 2, waitMinutes: 2 },
  { id: 102, name: "James Carter", eventId: 1, tickets: 4, waitMinutes: 8 },
  { id: 103, name: "Diego Alvarez", eventId: 1, tickets: 3, waitMinutes: 15 },
  { id: 104, name: "Priya Nair", eventId: 2, tickets: 1, waitMinutes: 3 },
  { id: 105, name: "Sarah Kim", eventId: 2, tickets: 2, waitMinutes: 11 },
  { id: 106, name: "Tom Nguyen", eventId: 2, tickets: 6, waitMinutes: 19 },
  { id: 107, name: "Ava Chen", eventId: 3, tickets: 2, waitMinutes: 4 },
  { id: 108, name: "Marcus Bell", eventId: 3, tickets: 2, waitMinutes: 13 },
];
