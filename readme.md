To get started, you need to install
[Deno](https://docs.deno.com/runtime/manual/getting_started/installation/).

Deno is a modern JavaScript runtime created by the creator of NodeJS.

[It fixed lots of design mistakes of NodeJS.](https://www.youtube.com/watch?v=M3BM9TB-8yA)

# Development Guidance
When you are developing and need to test changes in the frontend or mobile app, change the patch version in [deno.json](./deno.json) to `+1` and add a `-rc(+1)`.

For example, if the current `main` is at `0.0.1`, your development versions should be
`0.0.2-rc1`, `0.0.2-rc2` etc.

Then, `make publish` to upload the latest package to JSR.

In the application repository such as the frontend or the mobile,

`pnpm dlx jsr add @satlantis/api-client` to download the latest version.

# Release
Once your development branch is merged, remove the `rc` suffix and publish the production version.

Currently we don't have a GitHub Action setup.

Do `make publish` manually.
