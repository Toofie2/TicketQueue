import express from 'express';
import PDFDocument from 'pdfkit';
import { query } from '../db/pool.js';

const router = express.Router();

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function gatherData({ from, to, serviceId } = {}) {
  const svcId = serviceId && !isNaN(Number(serviceId)) ? Number(serviceId) : null;
  const dateFrom = ISO_DATE.test(from || '') ? from : null;
  const dateTo = ISO_DATE.test(to || '') ? to : null;

  let svcName = null;
  if (svcId) {
    const [srows] = await query('SELECT name FROM service WHERE id = ?', [svcId]);
    svcName = srows[0]?.name || null;
  }

  const [services] = await query(`
    SELECT s.id, s.name, s.category, s.priority, s.expectedDuration, s.price,
      (SELECT q.status FROM queue q WHERE q.serviceId = s.id ORDER BY q.id LIMIT 1) AS queueStatus,
      (SELECT COUNT(*) FROM queueentry qe JOIN queue q ON qe.queueId = q.id
         WHERE q.serviceId = s.id AND qe.status = 'waiting') AS waiting
    FROM service s
    ${svcId ? 'WHERE s.id = ?' : ''}
    ORDER BY s.id
  `, svcId ? [svcId] : []);

  const totalWaiting = services.reduce((a, s) => a + Number(s.waiting || 0), 0);

  const countHistory = async (outcome) => {
    const conds = ['h.outcome = ?'];
    const params = [outcome];
    if (dateFrom) { conds.push('h.eventDate >= ?'); params.push(dateFrom); }
    if (dateTo) { conds.push('h.eventDate <= ?'); params.push(dateTo); }
    if (svcName) { conds.push('h.serviceName = ?'); params.push(svcName); }
    const [rows] = await query(`SELECT COUNT(*) AS n FROM history h WHERE ${conds.join(' AND ')}`, params);
    return Number(rows[0].n);
  };
  const served = await countHistory('Served');
  const left = await countHistory('Left Queue');

  const [waitingRows] = await query(`
    SELECT qe.queueId, qe.priority, qe.joinTime
    FROM queueentry qe
    JOIN queue q ON qe.queueId = q.id
    WHERE qe.status = 'waiting' ${svcId ? 'AND q.serviceId = ?' : ''}
    ORDER BY qe.queueId,
      CASE qe.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END,
      qe.joinTime
  `, svcId ? [svcId] : []);
  const positionByQueue = {};
  let waitSum = 0;
  for (const entry of waitingRows) {
    const pos = (positionByQueue[entry.queueId] = (positionByQueue[entry.queueId] ?? -1) + 1);
    waitSum += pos;
  }
  const avgWait = waitingRows.length ? Math.round((waitSum / waitingRows.length) * 10) / 10 : 0;

  const partConds = [];
  const partParams = [];
  if (dateFrom) { partConds.push('h.eventDate >= ?'); partParams.push(dateFrom); }
  if (dateTo) { partConds.push('h.eventDate <= ?'); partParams.push(dateTo); }
  if (svcName) { partConds.push('h.serviceName = ?'); partParams.push(svcName); }
  const partWhere = partConds.length ? 'WHERE ' + partConds.join(' AND ') : '';
  const [historyRows] = await query(`
    SELECT c.email, p.fullName AS name, h.serviceName AS event, h.outcome, h.eventDate AS date
    FROM history h
    JOIN usercredentials c ON c.id = h.userId
    LEFT JOIN userprofile p ON p.userId = c.id
    ${partWhere}
    ORDER BY c.email, h.eventDate DESC, h.id DESC
  `, partParams);
  const byUser = {};
  for (const r of historyRows) {
    if (!byUser[r.email]) byUser[r.email] = { email: r.email, name: r.name || '', records: [] };
    byUser[r.email].records.push({ event: r.event, outcome: r.outcome, date: r.date });
  }

  return {
    generatedAt: new Date().toISOString(),
    filters: { from: dateFrom, to: dateTo, serviceId: svcId, serviceName: svcName },
    totalServices: services.length,
    totalWaiting,
    served,
    left,
    avgWait,
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      priority: s.priority,
      expectedDuration: s.expectedDuration,
      price: Number(s.price),
      queueOpen: s.queueStatus ? s.queueStatus === 'open' : true,
      inQueue: Number(s.waiting),
    })),
    participation: Object.values(byUser),
  };
}

router.get('/summary', async (req, res) => {
  try {
    res.json(await gatherData(req.query));
  } catch {
    res.status(500).json({ error: 'Could not build the report.' });
  }
});

router.get('/summary.pdf', async (req, res) => {
  try {
    const report = await gatherData(req.query);
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
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startX = doc.page.margins.left;

  doc.fontSize(20).fillColor('#2A3B4C').text('QueueSmart — Admin Report', { align: 'center' });
  doc
    .fontSize(10)
    .fillColor('gray')
    .text(`Generated ${new Date(report.generatedAt).toLocaleString()}`, { align: 'center' });

  const f = report.filters || {};
  const filterParts = [];
  filterParts.push(`Service: ${f.serviceName || 'All services'}`);
  if (f.from || f.to) {
    filterParts.push(`Dates: ${f.from || 'start'} to ${f.to || 'today'}`);
  } else {
    filterParts.push('Dates: all time');
  }
  doc.fontSize(10).fillColor('#2A3B4C').text(filterParts.join('     |     '), { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor('#2A3B4C').text('Queue Usage Statistics');
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('black').font('Helvetica');
  const stat = (label, value) =>
    doc.text(`${label}:  `, { continued: true }).font('Helvetica-Bold').text(String(value)).font('Helvetica');
  stat('Total events', report.totalServices);
  stat('Users currently in queue', report.totalWaiting);
  stat('Users served', report.served);
  stat('Users who left the queue', report.left);
  stat('Average wait time (min)', report.avgWait);
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor('#2A3B4C').text('Service Details & Queue Activity');
  doc.moveDown(0.5);

  const cols = [
    { label: 'Event', width: 170 },
    { label: 'Category', width: 120 },
    { label: 'Priority', width: 55 },
    { label: 'In Queue', width: 55 },
    { label: 'Queue', width: 55 },
  ];
  const totalColWidth = cols.reduce((a, c) => a + c.width, 0);

  const drawRow = (values, bold) => {
    if (doc.y > 770) doc.addPage();
    const y = doc.y;
    let x = startX;
    doc.fontSize(10).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor('black');
    values.forEach((v, i) => {
      doc.text(String(v), x, y, { width: cols[i].width, lineBreak: false });
      x += cols[i].width;
    });
    doc.moveDown(0.6);
    doc.x = startX;
  };

  drawRow(cols.map((c) => c.label), true);
  doc.moveTo(startX, doc.y).lineTo(startX + totalColWidth, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.3);
  for (const s of report.services) {
    drawRow([s.name, s.category || '-', s.priority, s.inQueue, s.queueOpen ? 'Open' : 'Closed']);
  }

  doc.moveDown(1.5);
  if (doc.y > 730) doc.addPage();
  doc.x = startX;
  doc.fontSize(14).fillColor('#2A3B4C').text('Customer Participation History', startX);
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('black');

  if (report.participation.length === 0) {
    doc.font('Helvetica').fillColor('gray').text('No participation history recorded yet.');
  } else {
    for (const user of report.participation) {
      if (doc.y > 760) doc.addPage();
      doc.font('Helvetica-Bold').fillColor('#2A3B4C').fontSize(11).text(`${user.name || user.email} (${user.email})`, startX, doc.y, { width: pageWidth });
      doc.font('Helvetica').fillColor('black').fontSize(10);
      for (const r of user.records) {
        if (doc.y > 780) doc.addPage();
        doc.text(`   • ${r.date}  —  ${r.event}  —  ${r.outcome}`, startX, doc.y, { width: pageWidth });
      }
      doc.moveDown(0.5);
    }
  }
}

export default router;
