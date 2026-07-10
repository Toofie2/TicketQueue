// src/data/userMockData.js

export const userData = {
  activeQueues: [
    { id: 101, event: "The Eras Tour", position: 42, waitTime: "15 mins" }
  ],
  notifications: [
    { id: 1, message: "Your queue for The Eras Tour has moved up 10 spots!" },
    { id: 2, message: "New VIP packages for Coachella 2027 are now available." },
    { id: 3, message: "Reminder: Complete your profile setup." }
  ],
  ticketHistory: [
    { id: 1, date: '2026-06-15', event: 'FIFA World Cup Finals', outcome: 'Served' },
    { id: 2, date: '2026-05-22', event: 'Houston Rockets vs Lakers', outcome: 'Left Queue' },
    { id: 3, date: '2026-04-10', event: 'Hamilton on Broadway', outcome: 'Served' }
  ],
  activeServices: [
    { id: 201, name: "Super Bowl LXI", status: "Queue opens in 2 hours" },
    { id: 202, name: "Formula 1 Miami", status: "Open now" }
  ]
};