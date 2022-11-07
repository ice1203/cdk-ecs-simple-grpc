# build用のコンテナ
FROM golang:1.18-alpine AS build

ENV ROOT=/go/src/project
WORKDIR ${ROOT}

COPY ./src ${ROOT}

RUN go mod download \
	&& CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# server用のコンテナ
FROM alpine:3.15.4

ENV ROOT=/go/src/project
WORKDIR ${ROOT}

RUN addgroup -S dockergroup && adduser -S docker -G dockergroup
USER docker

COPY --from=build ${ROOT}/server ${ROOT}

EXPOSE 8080
CMD ["./server"]