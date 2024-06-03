import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://example.com/user", ({ request }) => {
    const url = new URL(request.url);

    if (url.searchParams.get("id") === "123") {
      return HttpResponse.json({
        name: "Wlad",
      });
    }

    return HttpResponse.json({ msg: "Could not find user" }, { status: 404 });
  }),

  http.post("http://example.com/user", () => {
    return HttpResponse.json({
      id: "234",
    });
  }),
];
