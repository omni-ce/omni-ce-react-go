package main

import (
	"embed"
	"react-go/core"
	"react-go/core/variable"
)

//go:embed dist/*
var embedDist embed.FS

func main() {
	variable.EmbedDist = embedDist
	core.RunServer()
}
