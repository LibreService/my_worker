#include <stdio.h>

const char *file_name;
char buf[2];

void init() {
    file_name = "test_wasm.c";
}

char *first_char() {
    FILE *file = fopen(file_name, "r");
    fread(buf, 1, 1, file);
    fclose(file);
    return buf;
}
