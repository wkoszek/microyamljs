.PHONY: all build test clean install

all: build

install:
	npm install

build: install
	npm run build

test: build
	node test_parser.cjs

clean:
	rm -rf dist node_modules
