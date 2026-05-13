#!/bin/bash

TAGS=("latest")
PLATFORMS=("linux/amd64" "linux/arm64")

# Buildx 빌더 세팅 (이미 있으면 재사용)
docker buildx create --use --name local-builder || docker buildx use local-builder

for TAG in "${TAGS[@]}"; do
  for PLATFORM in "${PLATFORMS[@]}"; do
    docker buildx build \
      --platform=$PLATFORM \
      -t frontend-svc:$TAG-${PLATFORM##*/} \
      --load \
      .
  done
done
