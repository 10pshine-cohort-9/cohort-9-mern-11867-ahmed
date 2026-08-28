const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import '@testing-library/jest-dom';

jest.mock('quill', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    clipboard: { dangerouslyPasteHTML: jest.fn() },
    root: { innerHTML: "<p>Mock Content</p>" },
  }));
});
