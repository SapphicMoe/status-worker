import { Hono, Context as HonoContext } from "hono";
import { cors } from "hono/cors";
import * as model from "./model";
import type { Param } from "./model";

// types
type Bindings = {
  STATUS_SECRET: string;
  kv: KVNamespace;
};

type Env = {
  Bindings: Bindings;
};

type Context = HonoContext<Env>;

const app = new Hono<Env>();

app.use("*", cors());

// auth
const checkAuth = (c: Context) =>
  c.req.raw.headers.get("Authorization") === c.env.STATUS_SECRET;

const unauthorized = (c: Context) =>
  c.json({ code: "401 Unauthorized", message: "Unauthorized" }, 401);

app.use("*", async (c, next) => {
  c.res.headers.set("Vary", "Authorization");

  if (c.env.STATUS_SECRET === undefined) {
    return c.text("Secret is not defined. Please add STATUS_SECRET.");
  }

  if (!["GET", "HEAD"].includes(c.req.method) && !checkAuth(c)) {
    return unauthorized(c);
  }

  await next();
});

// main logic
app.get("/list", async (c) => {
  const statuses = await model.getStatuses(c.env.kv);

  if (!statuses.length) {
    return c.json(
      {
        code: "404 Not Found",
        message: "No statuses have been created.",
      },
      404
    );
  }

  return c.json({ statuses });
});

app.get("/", async (c) => {
  const statuses = await model.getStatuses(c.env.kv);

  if (!statuses.length) {
    return c.json(
      {
        code: "404 Not Found",
        message: "No statuses have been created.",
      },
      404
    );
  }

  const latestStatus = statuses[0];

  return c.json({ status: latestStatus });
});

app.post("/", async (c) => {
  let param: Param;

  try {
    param = await c.req.json();
  } catch {
    return c.json(
      {
        code: "400 Bad Request",
        message: "Please provide a JSON body for the status.",
      },
      400
    );
  }

  if (!(param.title && param.body))
    return c.json(
      {
        code: "400 Bad Request",
        message: "Please provide a title and body for the status.",
      },
      400
    );

  const status = await model.createStatus(c.env.kv, param);

  return c.json({ message: "Successfully created a new status.", status }, 201);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const status = await model.getStatus(c.env.kv, id);
  if (!status) {
    return c.json(
      {
        code: "404 Not Found",
        message: "Unable to find a status with that ID.",
      },
      404
    );
  }

  return c.json({ status });
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");

  const status = await model.getStatus(c.env.kv, id);
  if (!status) {
    return c.json(
      {
        code: "404 Not Found",
        message: "Unable to find a status with that ID.",
      },
      404
    );
  }

  const param = await c.req.json();
  await model.updateStatus(c.env.kv, id, param as model.Param);

  return c.json({
    message: "Status updated successfully.",
    status,
  });
});

app.delete("/", async (c) =>
  c.json(
    {
      code: "400 Bad Request",
      message: "Please provide a status ID to delete.",
    },
    400
  )
);

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const status = await model.getStatus(c.env.kv, id);
  if (!status) {
    return c.json(
      {
        code: "404 Not Found",
        message: "Unable to find a status with that ID.",
      },
      404
    );
  }

  await model.deleteStatus(c.env.kv, id);

  return c.json({
    message: "Status deleted successfully.",
    status,
  });
});

app.post("/*", async (c) =>
  c.json(
    {
      code: "405 Method Not Allowed",
      message: "POST not valid for individual statuses. Did you mean PUT?",
    },
    405
  )
);

app.all("*", (c) =>
  c.json(
    {
      code: "405 Method Not Allowed",
      message:
        "Unsupported method. Please use one of GET, PUT, POST, DELETE, HEAD.",
    },
    405
  )
);

export default app;
