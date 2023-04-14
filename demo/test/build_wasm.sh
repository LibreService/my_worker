emcc \
  -s EXPORTED_FUNCTIONS=_init,_first_char \
  -s EXPORTED_RUNTIME_METHODS='["ccall","FS"]' \
  --preload-file test_wasm.c \
  -o ../public/demo.js \
  test_wasm.c
