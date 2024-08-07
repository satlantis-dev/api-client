# To run this command, you need to be an admin of https://jsr.io/@satlantis
# Ask https://github.com/satoshisound
# or https://github.com/alberlantis
# to grant you access
publish:
	deno publish --allow-slow-types

fmt:
	deno fmt

test:
	deno test --allow-net
