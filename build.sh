#!/usr/bin/env bash

npx tailwindcss -i ./input.css -o ./output.css -m

openssl dgst -sha512 -binary output.css | openssl base64 -A
