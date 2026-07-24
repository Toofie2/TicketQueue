export const PRIORITIES = ['High', 'Medium', 'Low'];

export const nextId = (list) =>
  list.length ? Math.max(...list.map((item) => item.id)) + 1 : 1;

export function validateService(body = {}, { partial = false } = {}) {
  const { name, description, expectedDuration, priority, price, quantity } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim())
      return 'Service name is required.';
    if (name.length > 100)
      return 'Service name must be 100 characters or fewer.';
  }

  if (!partial || description !== undefined) {
    if (typeof description !== 'string' || !description.trim())
      return 'Description is required.';
    if (description.length > 500)
      return 'Description must be 500 characters or fewer.';
  }

  if (!partial || expectedDuration !== undefined) {
    if (
      expectedDuration === undefined ||
      expectedDuration === null ||
      expectedDuration === ''
    )
      return 'Expected duration is required.';
    const duration = Number(expectedDuration);
    if (Number.isNaN(duration))
      return 'Expected duration must be a number.';
    if (duration <= 0)
      return 'Expected duration must be greater than 0.';
  }

  if (priority !== undefined && !PRIORITIES.includes(priority))
    return 'Priority must be one of: High, Medium, Low.';

  if (
    price !== undefined &&
    price !== '' &&
    (Number.isNaN(Number(price)) || Number(price) < 0)
  )
    return 'Price must be a non-negative number.';

  if (
    quantity !== undefined &&
    quantity !== '' &&
    (Number.isNaN(Number(quantity)) || Number(quantity) < 0)
  )
    return 'Quantity must be a non-negative number.';

  return null;
}

export function buildService(body, id) {
  return {
    id,
    name: body.name.trim(),
    description: body.description.trim(),
    expectedDuration: Number(body.expectedDuration),
    priority: body.priority || 'Medium',
    venue: typeof body.venue === 'string' ? body.venue.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : '',
    time: typeof body.time === 'string' ? body.time.trim() : '',
    date: body.date || '',
    price: body.price !== undefined && body.price !== '' ? Number(body.price) : 0,
    quantity:
      body.quantity !== undefined && body.quantity !== ''
        ? Number(body.quantity)
        : 0,
  };
}
