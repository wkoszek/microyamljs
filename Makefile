.PHONY: all build test clean install rel publish

all: build

install:
	npm install

build: install
	npm run build

test: build
	node test_parser.cjs

clean:
	rm -rf dist node_modules

rel:
	@bash scripts/release.sh

publish:
	@git diff --quiet && git diff --cached --quiet || \
		(echo "Error: uncommitted changes — commit or stash first" && exit 1)
	npm publish
	@echo ""
	@echo "✓  Published to npm."
	@echo "   Push the release tag:  git push --follow-tags"
