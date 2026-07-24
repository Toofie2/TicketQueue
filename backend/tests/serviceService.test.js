import {
  validateService,
  buildService,
  nextId,
} from '../services/serviceService.js';

describe('serviceService.validateService', () => {
  const valid = {
    name: 'Astros vs Yankees',
    description: 'MLB regular season game',
    expectedDuration: 120,
    priority: 'High',
  };

  test('accepts a valid service', () => {
    expect(validateService(valid)).toBeNull();
  });

  test('requires a name', () => {
    expect(validateService({ ...valid, name: '' })).toMatch(/name is required/i);
  });

  test('rejects a name longer than 100 characters', () => {
    expect(validateService({ ...valid, name: 'a'.repeat(101) })).toMatch(
      /100 characters/i
    );
  });

  test('requires a description', () => {
    expect(validateService({ ...valid, description: '   ' })).toMatch(
      /description is required/i
    );
  });

  test('rejects a description longer than 500 characters', () => {
    expect(validateService({ ...valid, description: 'a'.repeat(501) })).toMatch(
      /500 characters/i
    );
  });

  test('requires an expected duration', () => {
    expect(validateService({ ...valid, expectedDuration: '' })).toMatch(
      /required/i
    );
  });

  test('rejects a non-numeric duration', () => {
    expect(validateService({ ...valid, expectedDuration: 'soon' })).toMatch(
      /must be a number/i
    );
  });

  test('rejects a duration of zero or less', () => {
    expect(validateService({ ...valid, expectedDuration: 0 })).toMatch(
      /greater than 0/i
    );
  });

  test('rejects an invalid priority', () => {
    expect(validateService({ ...valid, priority: 'Urgent' })).toMatch(
      /High, Medium, Low/
    );
  });

  test('rejects a negative price', () => {
    expect(validateService({ ...valid, price: -5 })).toMatch(/price/i);
  });

  test('rejects a negative quantity', () => {
    expect(validateService({ ...valid, quantity: -1 })).toMatch(/quantity/i);
  });

  test('partial update skips fields that are absent', () => {
    expect(validateService({ priority: 'Low' }, { partial: true })).toBeNull();
  });

  test('partial update still validates fields that are present', () => {
    expect(validateService({ name: '' }, { partial: true })).toMatch(
      /name is required/i
    );
  });
});

describe('serviceService.nextId', () => {
  test('returns 1 for an empty list', () => {
    expect(nextId([])).toBe(1);
  });

  test('returns max id + 1', () => {
    expect(nextId([{ id: 3 }, { id: 7 }, { id: 2 }])).toBe(8);
  });
});

describe('serviceService.buildService', () => {
  test('trims strings and coerces numeric fields', () => {
    const service = buildService(
      {
        name: '  Gala Night  ',
        description: '  A fancy show  ',
        expectedDuration: '90',
        price: '45',
        quantity: '10',
      },
      5
    );
    expect(service).toMatchObject({
      id: 5,
      name: 'Gala Night',
      description: 'A fancy show',
      expectedDuration: 90,
      price: 45,
      quantity: 10,
      priority: 'Medium',
    });
  });
});
