/*
  Duplicate checker simulation for CRM customer matching.
  This models how an extension-side duplicate warning can rank candidates
  before integrating with live CRM search responses.
*/

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreCandidate(input, candidate) {
  let score = 0;
  const reasons = [];

  const inputPhone = normalizePhone(input.phone);
  const inputEmail = normalizeEmail(input.email);
  const inputFirst = normalizeName(input.firstName);
  const inputLast = normalizeName(input.lastName);

  const candPhoneA = normalizePhone(candidate.phone1);
  const candPhoneB = normalizePhone(candidate.phone2);
  const candEmailA = normalizeEmail(candidate.email1);
  const candEmailB = normalizeEmail(candidate.email2);
  const candFirst = normalizeName(candidate.firstName);
  const candLast = normalizeName(candidate.lastName);

  if (inputPhone && (inputPhone === candPhoneA || inputPhone === candPhoneB)) {
    score += 100;
    reasons.push('exact_phone');
  }

  if (inputEmail && (inputEmail === candEmailA || inputEmail === candEmailB)) {
    score += 95;
    reasons.push('exact_email');
  }

  if (inputFirst && inputLast && inputFirst === candFirst && inputLast === candLast) {
    score += 70;
    reasons.push('exact_name');
  }

  if (!inputFirst && inputLast && inputLast === candLast) {
    score += 30;
    reasons.push('last_name_only');
  }

  if (inputFirst && !inputLast && inputFirst === candFirst) {
    score += 20;
    reasons.push('first_name_only');
  }

  if (input.phone && !reasons.includes('exact_phone')) {
    const inPhone = normalizePhone(input.phone);
    const contains = [candPhoneA, candPhoneB].some((p) => p && (p.includes(inPhone) || inPhone.includes(p)));
    if (contains && inPhone.length >= 4) {
      score += 25;
      reasons.push('partial_phone');
    }
  }

  return { score, reasons };
}

function findDuplicates(input, customers) {
  return customers
    .map((candidate) => {
      const result = scoreCandidate(input, candidate);
      return { candidate, ...result };
    })
    .filter((x) => x.score >= 50)
    .sort((a, b) => b.score - a.score);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  const customers = [
    {
      id: 'c1',
      firstName: 'Sam',
      lastName: 'Rivera',
      phone1: '112',
      phone2: '',
      email1: 'sam.rivera@example.com',
      email2: ''
    },
    {
      id: 'c2',
      firstName: 'Samuel',
      lastName: 'Baker',
      phone1: '(555) 101-1212',
      phone2: '',
      email1: 'sbaker@example.com',
      email2: ''
    },
    {
      id: 'c3',
      firstName: 'Taylor',
      lastName: 'Nguyen',
      phone1: '555-333-9000',
      phone2: '',
      email1: 't.nguyen@example.com',
      email2: ''
    }
  ];

  const tests = [
    {
      name: 'Exact phone should rank first',
      input: { firstName: '', lastName: '', phone: '112', email: '' },
      expectedTopId: 'c1'
    },
    {
      name: 'Exact email should rank first',
      input: { firstName: '', lastName: '', phone: '', email: 'SAM.RIVERA@EXAMPLE.COM' },
      expectedTopId: 'c1'
    },
    {
      name: 'Exact full name should rank first',
      input: { firstName: 'sam', lastName: 'rivera', phone: '', email: '' },
      expectedTopId: 'c1'
    },
    {
      name: 'No strong match should return none',
      input: { firstName: 'alex', lastName: 'thorpe', phone: '999999', email: 'alex@none.com' },
      expectedTopId: null
    }
  ];

  const lines = [];
  let passCount = 0;

  tests.forEach((t) => {
    const result = findDuplicates(t.input, customers);
    const topId = result[0] ? result[0].candidate.id : null;
    const pass = topId === t.expectedTopId;

    if (pass) {
      passCount += 1;
      lines.push(`PASS: ${t.name}`);
    } else {
      lines.push(`FAIL: ${t.name} (expected=${t.expectedTopId}, actual=${topId})`);
    }

    if (result.length > 0) {
      const detail = result.slice(0, 2).map((r) => `${r.candidate.id}:${r.score}[${r.reasons.join(',')}]`).join(' | ');
      lines.push(`  Top matches: ${detail}`);
    }
  });

  console.log('DUPLICATE_SIM_TEST_START');
  lines.forEach((line) => console.log(line));
  console.log(`Summary: ${passCount}/${tests.length} passed`);
  console.log('DUPLICATE_SIM_TEST_END');

  assert(passCount === tests.length, 'One or more duplicate-simulation tests failed.');
}

run();
