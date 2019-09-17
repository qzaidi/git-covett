# covett

> A GitHub App built with [Probot](https://github.com/probot/probot) that performs Developer analytics

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```


## Testing

You can simulate the webhook using

```
./node_modules/.bin/probot receive -e installation -p test/fixtures/installation.created.json ./index.js
```

## Contributing

If you have suggestions for how covett could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).
