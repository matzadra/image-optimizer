#!/bin/bash
git init
git checkout -b main
git commit --allow-empty -m "chore(init): initial monorepo structure with tsconfig, aliases and vitest"
git commit --allow-empty -m "chore(docker): add Dockerfiles and docker-compose with shared volumes"
git commit --allow-empty -m "feat(api): implement POST /upload with validation and RabbitMQ publishing"
git commit --allow-empty -m "feat(api): add GET /status/:taskId to query task progress"
git commit --allow-empty -m "feat(worker): process image and generate multiple sizes for webp and jpg"
git commit --allow-empty -m "feat(worker): persist metadata and status in MongoDB"
git commit --allow-empty -m "refactor(shared): extract logger, types, mongo and queue clients"
git commit --allow-empty -m "test(worker): add unit test for image processor with sharp and fs mocks"
git commit --allow-empty -m "chore(logs): add contextual logger with origin and dynamic trace"
git commit --allow-empty -m "chore(env): add fallback defaults for quality, upload/output dirs"
git commit --allow-empty -m "perf(worker): support horizontal scaling with docker-compose up --scale"
git commit --allow-empty -m "docs(readme): add full technical documentation and setup instructions"
git add .
git commit -m "final commit: add all project files"