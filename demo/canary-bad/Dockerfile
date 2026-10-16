# Image "hong" cho demo canary: lay image da build roi them fault.js.
# Build: docker build -t catarena/customer:v5-bad --build-arg SERVICE=customer --build-arg BASE_TAG=v4 demo/canary-bad
ARG SERVICE=customer
ARG BASE_TAG=v4
FROM catarena/${SERVICE}:${BASE_TAG}

COPY --chown=node:node fault.js ./fault.js

CMD ["node", "--require", "./instrumentation.js", "--require", "./fault.js", "src/index.js"]
