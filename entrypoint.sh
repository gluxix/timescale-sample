#!/bin/sh

set -e

npm run createdb
npm run seed
npm run start
