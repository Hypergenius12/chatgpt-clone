import test from 'node:test';
import assert from 'node:assert/strict';
import {
  groupChatsByDate,
  extractThoughtAndContent,
  extractCanvasCodeBlock,
  generateChatTitleFallback,
  estimateTokens,
  getUserInitials,
  validateEmail,
  getFileExtension,
  calculateTotalChatTokens,
  ChatSession,
} from './chatUtils';

test('groupChatsByDate categorizes chats correctly by time and pin state', () => {
  const refTime = new Date('2026-11-05T12:00:00Z').getTime();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const sampleChats: ChatSession[] = [
    {
      id: '1',
      title: 'Pinned Research',
      createdAt: refTime - 10 * oneDay,
      updatedAt: refTime - 10 * oneDay,
      model: 'gpt-4o',
      isPinned: true,
    },
    {
      id: '2',
      title: 'Today Chat',
      createdAt: refTime - 2 * oneHour,
      updatedAt: refTime - 2 * oneHour,
      model: 'gpt-4o',
    },
    {
      id: '3',
      title: 'Yesterday Chat',
      createdAt: refTime - 26 * oneHour,
      updatedAt: refTime - 26 * oneHour,
      model: 'o1',
    },
    {
      id: '4',
      title: 'Last Week Chat',
      createdAt: refTime - 4 * oneDay,
      updatedAt: refTime - 4 * oneDay,
      model: 'gpt-4o-mini',
    },
    {
      id: '5',
      title: 'Last Month Chat',
      createdAt: refTime - 20 * oneDay,
      updatedAt: refTime - 20 * oneDay,
      model: 'gpt-4o',
    },
    {
      id: '6',
      title: 'Archived Chat',
      createdAt: refTime - 2 * oneHour,
      updatedAt: refTime - 2 * oneHour,
      model: 'gpt-4o',
      isArchived: true,
    },
  ];

  const grouped = groupChatsByDate(sampleChats, refTime);

  assert.equal(grouped.pinned.length, 1);
  assert.equal(grouped.pinned[0].id, '1');

  assert.equal(grouped.today.length, 1);
  assert.equal(grouped.today[0].id, '2');

  assert.equal(grouped.yesterday.length, 1);
  assert.equal(grouped.yesterday[0].id, '3');

  assert.equal(grouped.previous7Days.length, 1);
  assert.equal(grouped.previous7Days[0].id, '4');

  assert.equal(grouped.previous30Days.length, 1);
  assert.equal(grouped.previous30Days[0].id, '5');

  // Archived should not appear in active groups
  const allIds = [
    ...grouped.pinned,
    ...grouped.today,
    ...grouped.yesterday,
    ...grouped.previous7Days,
    ...grouped.previous30Days,
    ...grouped.older,
  ].map((c) => c.id);

  assert.equal(allIds.includes('6'), false);
});

test('extractThoughtAndContent ensures full content is visible in chat', () => {
  const input = '<thought>\nStep 1: Parse the user formula.\nStep 2: Solve x^2 = 4.\n</thought>\nThe solutions are x = 2 and x = -2.';
  const result = extractThoughtAndContent(input);

  assert.equal(result.content.includes('The solutions are x = 2 and x = -2.'), true);
  assert.equal(result.content.includes('Step 1: Parse the user formula'), true);
  assert.equal(result.content.includes('<thought>'), false);
});

test('transformDalleJson converts raw tool call JSON into image embed', () => {
  const rawJson = '{\n"action": "dalle.text2im",\n"action_input": "{ \\"prompt\\": \\"A greenhouse on Mars at blue hour\\" }",\n"thought": "Generating image"\n}';
  const formatted = extractThoughtAndContent(rawJson);

  assert.equal(formatted.content.includes('![A greenhouse on Mars at blue hour]'), true);
  assert.equal(formatted.content.includes('https://image.pollinations.ai/prompt/'), true);
  assert.equal(formatted.content.includes('dalle.text2im'), false);
});

test('extractCanvasCodeBlock identifies HTML / JS for Canvas preview', () => {
  const markdown = 'Here is an interactive button:\n\n```html\n<button onclick="alert(1)">Click</button>\n```\nEnjoy!';
  const extracted = extractCanvasCodeBlock(markdown);

  assert.notEqual(extracted, null);
  assert.equal(extracted?.language, 'html');
  assert.equal(extracted?.code, '<button onclick="alert(1)">Click</button>');
  assert.equal(extracted?.isExecutable, true);
});

test('generateChatTitleFallback truncates cleanly', () => {
  assert.equal(generateChatTitleFallback('How to train a neural network'), 'How to train a neural network');
  assert.equal(
    generateChatTitleFallback('Explain in great detail the history of quantum mechanics and general relativity in the 20th century'),
    'Explain in great detail the history...'
  );
  assert.equal(generateChatTitleFallback(''), 'New chat');
});

test('estimateTokens calculates approximate token counts', () => {
  assert.equal(estimateTokens('abcd'), 1);
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('Hello world! This is a test.'), 7);
});

test('getUserInitials extracts clean uppercase initials', () => {
  assert.equal(getUserInitials('Caleb Anne'), 'CA');
  assert.equal(getUserInitials('John'), 'JO');
  assert.equal(getUserInitials('calebanne8@gmail.com'), 'C');
  assert.equal(getUserInitials(''), 'U');
});

test('validateEmail validates valid and invalid emails', () => {
  assert.equal(validateEmail('test@example.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('user@domain.org'), true);
});

test('getFileExtension maps programming languages to file extensions', () => {
  assert.equal(getFileExtension('python'), 'py');
  assert.equal(getFileExtension('javascript'), 'js');
  assert.equal(getFileExtension('typescript'), 'ts');
  assert.equal(getFileExtension('html'), 'html');
  assert.equal(getFileExtension('json'), 'json');
  assert.equal(getFileExtension('csv'), 'csv');
  assert.equal(getFileExtension('unknown-lang'), 'txt');
});

test('calculateTotalChatTokens aggregates token estimates', () => {
  const msgs = [
    { content: 'Hello world' }, // 11 chars -> 3 tokens
    { content: 'This is another test message', thought: 'Thinking process' },
  ];
  const count = calculateTotalChatTokens(msgs);
  assert.equal(count > 0, true);
});
