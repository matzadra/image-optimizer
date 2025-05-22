#!/bin/sh

# usage: ./wait-for.sh host:port -- command args
# ex: ./wait-for.sh rabbitmq:5672 -- node dist/index.js

hostport="$1"
shift

host=$(echo "$hostport" | cut -d: -f1)
port=$(echo "$hostport" | cut -d: -f2)

echo "Waiting for $host:$port to become available..."

while ! nc -z "$host" "$port"; do
  sleep 1
done

echo "$host:$port is available! Executing command..."
exec "$@"
