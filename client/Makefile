.PHONY: clean
clean:
	rm -rf .cache public

.PHONY: develop
develop:
	npm start

.PHONY: format
format:
	cd .. && $(MAKE) format

.PHONY: test-lint
test-lint:
	npm run test:lint
