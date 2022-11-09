
package main

import (
	"google.golang.org/grpc"
	"log"
	"io"
	"errors"
)

func myStreamServerInterceptor1(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	// ストリームがopenされたときに行われる前処理
	log.Println("[pre stream] my stream server interceptor 1: ", info.FullMethod)

	err := handler(srv, &myServerStreamWrapper1{ss}) // 本来のストリーム処理

	// ストリームがcloseされるときに行われる後処理
	log.Println("[post stream] my stream server interceptor 1: ")
	return err
}

type myServerStreamWrapper1 struct {
	grpc.ServerStream
}

func (s *myServerStreamWrapper1) RecvMsg(m interface{}) error {
	// ストリームから、リクエストを受信
	err := s.ServerStream.RecvMsg(m)
	// 受信したリクエストを、ハンドラで処理する前に差し込む前処理
	if !errors.Is(err, io.EOF) {
		log.Println("[pre message] my stream server interceptor 1: ", m)
	}
	return err
}

func (s *myServerStreamWrapper1) SendMsg(m interface{}) error {
	// ハンドラで作成したレスポンスを、ストリームから返信する直前に差し込む後処理
	log.Println("[post message] my stream server interceptor 1: ", m)
	return s.ServerStream.SendMsg(m)
}