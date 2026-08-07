import express from 'express';
import PDFDocument from 'pdfkit';
import { query } from '../db/pool.js';
import { db } from '../data/db.js';
import { history } from './mockDB.js';

const router = express.Router();

function computeStats() {
  const totalInQueue = db.queue.length;
  const served = history.filter((h) => h.outcome === 'Served').length;
  const left = history.filter((h) => h.outcome === 'Left Queue').length;

  const positionByEvent = {};
  let waitSum = 0;
  for (const entry of db.queue) {
    const pos = (positionByEvent[entry.serviceId] = (positionByEvent[entry.serviceId] ?? -1) + 1);
    waitSum += pos;
  }
  const avgWait = totalInQueue ? Math.round((waitSum / totalInQueue) * 10) / 10 : 0;

  return { totalInQueue, served, left, avgWait };
}

async function buildReport() {
  const [rows] = await query(
    `SELECT s.id, s.name, s.category, s.priority, s.expectedDuration, s.price, q.status AS queueStatus
     FROM service s LEFT JOIN queue q ON q.serviceId = s.id
     ORDER BY s.id`
  );

  const services = rows.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    priority: s.priority,
    expectedDuration: s.expectedDuration,
    price: Number(s.price),
    queueOpen: s.queueStatus ? s.queueStatus === 'open' : true,
    inQueue: db.queue.filter((e) => e.serviceId === s.name).length,
  }));

  return {
    generatedAt: new Date().toISOString(),
    totalServices: services.length,
    ...computeStats(),
    services,
  };
}

router.get('/summary', async (req, res) => {
  try {
    res.json(await buildReport());
  } catch {
    res.status(500).json({ error: 'Could not build the report.' });
  }
});

router.get('/summary.pdf', async (req, res) => {
  try {
    const report = await buildReport();
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="queuesmart-report.pdf"');
    doc.pipe(res);

    renderPdf(doc, report);
    doc.end();
  } catch {
    if (!res.headersSent) res.status(500).json({ error: 'Could not generate the PDF.' });
  }
});

function renderPdf(doc, report) {
  doc.fontSize(20).fillColor('#2A3B4C').text('QueueSmart — Admin Report', { align: 'center' });
  doc
    .fontSize(10)
    .fillColor('gray')
    .text(`Generated ${new Date(report.generatedAt).toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor('#2A3B4C').text('Queue Usage Statistics');
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('black');
  const stat = (label, value) => doc.text(`${label}:  `, { continued: true }).font('Helvetica-Bold').text(String(value)).font('Helvetica');
  stat('Total events', report.totalServices);
  stat('Users currently in queue', report.totalInQueue);
  stat('Users served', report.served);
  stat('Users who left the queue', report.left);
  stat('Average wait time (min)', report.avgWait);
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor('#2A3B4C').text('Service Details & Queue Activity');
  doc.moveDown(0.5);

  const cols = [
    { key: 'name', label: 'Event', width: 170 },
    { key: 'category', label: 'Category', width: 120 },
    { key: 'priority', label: 'Priority', width: 55 },
    { key: 'inQueue', label: 'In Queue', width: 55 },
    { key: 'status', label: 'Queue', width: 55 },
  ];
  const startX = 50;

  const drawRow = (values, opts = {}) => {
    const y = doc.y;
    let x = startX;
    doc.fontSize(10);
    if (opts.bold) doc.font('Helvetica-Bold');
    else doc.font('Helvetica');
    doc.fillColor(opts.color || 'black');
    cols.forEach((c, i) => {
      doc.text(String(values[i]), x, y, { width: c.width, lineBreak: false });
      x += c.width;
    });
    doc.moveDown(0.6);
  };

  drawRow(cols.map((c) => c.label), { bold: true });
  doc.moveTo(startX, doc.y).lineTo(startX + cols.reduce((a, c) => a + c.width, 0), doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.3);

  for (const s of report.services) {
    if (doc.y > 760) {
      doc.addPage();
    }
    drawRow([
      s.name,
      s.category || '-',
      s.priority,
      s.inQueue,
      s.queueOpen ? 'Open' : 'Closed',
    ]);
  }
}

export default router;
