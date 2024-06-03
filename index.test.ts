import { describe, it, expect, expectTypeOf, assertType } from "vitest";

import { createAPIMethod, type NotFound } from "./index";

describe("createAPIMethod", () => {
  it("should return a function that makes a GET request", async () => {
    type Input = { id: string };
    type Output = { name: string };
    const getMethod = createAPIMethod<Input, Output>({
      method: "GET",
      url: "http://example.com/user",
    });

    // Make the API call
    const result = await getMethod({ id: "123" });
    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    // @ts-ignore
    expect(result.data).toEqual({ name: "Wlad" });
  });

  it("should return a function that makes a POST request", async () => {
    type Input = { name: string };
    type Output = { id: string };
    const postMethod = createAPIMethod<Input, Output>({
      method: "POST",
      url: "http://example.com/user",
    });

    // Make the API call
    const result = await postMethod({ name: "Paiva" });
    expect(result).toBeDefined();
    expect(result.success).toBeTruthy();
    // @ts-ignore
    expect(result.data).toEqual({ id: "234" });
  });

  // testing types
  it("should return the correct types", async () => {
    type Input = { id: string };
    type Output = { name: string };
    type Error = { msg: string };
    const getMethod = createAPIMethod<Input, Output, NotFound<Error>>({
      method: "GET",
      url: "http://example.com/user",
    });

    // Make the API call that works
    const result = await getMethod({ id: "123" });
    if (result.success) {
      expectTypeOf(result.data).toEqualTypeOf<Output>();
    } else {
      throw new Error("This should not happen");
    }

    // Make the API call that does not work
    const resultNotFound = await getMethod({ id: "not-found" });

    if (!resultNotFound.success) {
      expectTypeOf(resultNotFound.error.data).toEqualTypeOf<Error>();
      expect(resultNotFound.error.data.msg).toEqual("Could not find user");
    } else {
      throw new Error("This should not happen");
    }
  });
});
