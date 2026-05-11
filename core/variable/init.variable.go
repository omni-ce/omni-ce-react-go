package variable

import (
	"io/fs"
	"os"
	"path/filepath"
)

var UploadsPath string
var EmbedDist fs.FS

func init() {
	cwd, _ := os.Getwd()
	UploadsPath = filepath.Join(cwd, "uploads")
	os.MkdirAll(UploadsPath, 0755)
}
