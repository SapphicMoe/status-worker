# status-worker

A simple service for Cloudflare Workers that allows you to display your current status to others with ease!

## Deploy

Run these commands in their respective order:

- `pnpm install`
- `pnpm addsecret`
- `pnpm createkv`
- `pnpm deploy`

## Debugging

If you want to debug `status-worker`, you can run `pnpm dev`. This will summon a local instance of the project.

To change the secrets in the local instance, rename the `.dev.vars.example` file to `.dev.vars` and edit `STATUS_SECRET` to your custom defined secret.

## Usage

Once you deploy `status-worker` to Cloudflare Workers, it should be relatively straightforward to use the API.

### Creating a status

To create a status, send a `POST` request to `/` with the following options:

- `Authorization`: This is the secret you defined when running `pnpm addsecret`.
- `Content-Type`: `application/json`
- Body data:
  - `title`: The title of your status.
  - `body`: The content of your status.

For example:

```json
lily@sapphic-angels:~$ curl -X POST \
  -H "Authorization: mysecret" \
  -H "Content-Type: application/json" \
  -d '{"title": "Status title", "body": "Status content"}' \
  https://status.example.com

{
  "message": "Successfully created a new status.",
  "status": {
    "id": "3c523f18-f20c-48df-acba-b330f11e66da",
    "title": "Status title",
    "body": "Status content",
    "date": "2024-01-05T12:16:55.479Z"
  }
}
```

**Note**:
On Windows, you might encounter issues with the command prompt interpreting certain characters. To resolve this, use double quotes around the JSON data. (ex. `"{\"title\": \"Status title\", \"body\": \"Status content\"}"`)

### Viewing a status

To view your latest status, send a `GET` request to `/`.

```json
lily@sapphic-angels:~$ curl https://status.example.com/

{
  "status": {
    "id": "3c523f18-f20c-48df-acba-b330f11e66da",
    "title": "Status title",
    "body": "Status content",
    "date": "2024-01-05T12:16:55.479Z"
  }
}
```

To view a specific status, send a `GET` request to that specific ID.

```json
lily@sapphic-angels:~$ curl https://status.example.com/5250f13c-fa8a-458c-b09b-8523d86d5428

{
  "status": {
    "id": "5250f13c-fa8a-458c-b09b-8523d86d5428",
    "title": "Example",
    "body": "test test",
    "date": "2024-01-05T12:17:05.118Z"
  }
}
```

To view all created statuses, send a `GET` request to `/list`.

```json
lily@sapphic-angels:~$ curl https://status.example.com/list

{
  "statuses": [
    {
      "id": "3c523f18-f20c-48df-acba-b330f11e66da",
      "title": "meow",
      "body": "curl test 2",
      "date": "2024-01-05T12:16:55.479Z"
    },
    {
      "id": "b872946c-10d9-4942-8194-0ed65aaa420f",
      "title": "meow",
      "body": "curl test 3",
      "date": "2024-01-05T12:22:01.292Z"
    }
  ]
}
```

### Updating a status

To update a specific status, send a `PUT` request to that specific status ID.

```json
lily@sapphic-angels:~$ curl -X PUT \
  -H "Authorization: mysecret" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated status title", "body": "Updated status content"}' \
  https://status.example.com/3c523f18-f20c-48df-acba-b330f11e66da

{
  "message": "Status updated successfully.",
  "status": {
    "id": "3c523f18-f20c-48df-acba-b330f11e66da",
    "title": "Old status title",
    "body": "Old status content",
    "date": "2024-01-05T12:16:55.479Z"
  }
}
```

### Deleting a status

To delete a specific status, send a `DELETE` request to that specific status ID.

```json
lily@sapphic-angels:~$ curl -X DELETE \
  -H "Authorization: mysecret" \
  https://status.example.com/3c523f18-f20c-48df-acba-b330f11e66da

{
  "message": "Status deleted successfully.",
  "status": {
    "id": "3c523f18-f20c-48df-acba-b330f11e66da",
    "title": "Status title",
    "body": "Status content",
    "date": "2024-01-05T12:16:55.479Z"
  }
}
```

## Credits

Some of the code for this project has been borrowed from Erisa's **[worker-links](https://github.com/Erisa/worker-links)** project.

I encourage you to check it out!

## License

&copy; 2024 Chloe Arciniega. Licensed under [MIT](LICENSE).
