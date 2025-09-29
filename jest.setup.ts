import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

const nodeFetch = require('node-fetch');
global.Request = nodeFetch.Request;
global.Response = nodeFetch.Response;
global.Headers = nodeFetch.Headers;

jest.mock('next-auth/next', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  }))
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      },
      expires: '2024-01-01'
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  }))
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '',
  })),
  usePathname: jest.fn(() => ''),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));
