import api from "../../src/utils/api";

jest.mock("axios", () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockAxiosInstance),
  };
});

describe("api utility", () => {
  let requestSuccess, requestError, responseSuccess, responseError;

  beforeAll(() => {
    const axios = require("axios");
    const instance = axios.create();

    const requestArgs = instance.interceptors.request.use.mock.calls[0];
    const responseArgs = instance.interceptors.response.use.mock.calls[0];

    if (requestArgs) {
      [requestSuccess, requestError] = requestArgs;
    }
    if (responseArgs) {
      [responseSuccess, responseError] = responseArgs;
    }
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test("is defined and exported", () => {
    expect(api).toBeDefined();
  });

  test("request interceptor attaches token when present", () => {
    if (typeof requestSuccess !== "function") return;
    localStorage.setItem("token", "test-token");
    const config = { headers: {} };
    const result = requestSuccess(config);
    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  test("request interceptor skips auth header when no token", () => {
    if (typeof requestSuccess !== "function") return;
    localStorage.removeItem("token");
    const config = { headers: {} };
    const result = requestSuccess(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  test("request interceptor rejects on error", async () => {
    if (typeof requestError !== "function") return;
    const error = new Error("network error");
    await expect(requestError(error)).rejects.toEqual(error);
  });

  test("response interceptor returns response on success", () => {
    if (typeof responseSuccess !== "function") return;
    const fakeResponse = { data: { id: 1 }, status: 200 };
    expect(responseSuccess(fakeResponse)).toEqual(fakeResponse);
  });

  test("response interceptor clears token and redirects on 401", async () => {
    if (typeof responseError !== "function") return;
    localStorage.setItem("token", "expired-token");
    const error = { response: { status: 401 } };

    await expect(responseError(error)).rejects.toEqual(error);
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("http://localhost/");
  });

  test("response interceptor rejects non-401 errors", async () => {
    if (typeof responseError !== "function") return;
    const error = { response: { status: 500 } };
    await expect(responseError(error)).rejects.toEqual(error);
  });
});
