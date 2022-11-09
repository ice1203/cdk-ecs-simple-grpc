# build用のコンテナ
FROM golang:1.18-alpine AS build

ENV ROOT=/go/src/project
WORKDIR ${ROOT}

COPY ./src ${ROOT}

RUN go mod download \
	&& CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

RUN GRPC_HEALTH_PROBE_VERSION=v0.4.14 && \
    wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-arm64 && \
    chmod +x /bin/grpc_health_probe
# server用のコンテナ
FROM alpine:3.15.4

ENV ROOT=/go/src/project
WORKDIR ${ROOT}

RUN addgroup -S dockergroup && adduser -S docker -G dockergroup
USER docker

COPY --from=build ${ROOT}/server ${ROOT}
COPY --from=build /bin/grpc_health_probe /bin/grpc_health_probe

EXPOSE 8080
CMD ["./server"]