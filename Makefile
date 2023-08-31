TEST_E2E_DOCKER_COMPOSE=docker-compose
TEST_E2E_IMAGE_SNAPSHOTS_PATH?=cypress/snapshots
TEST_E2E_DOCKER_IMAGE_SNAPSHOTS_PATH?=/app/$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)
TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH?=$(PWD)/cypress/$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)

node_modules/license-check-and-add:
	npm ci

node_modules/prettier:
	npm ci

.PHONY: clean
clean:
	cd client && $(MAKE) clean

.PHONY: format
format:
	npm run license:fix && npm run format

.PHONY: develop
develop:
	cd client && $(MAKE) develop

.PHONY: test
test:
	cd cypress && npm run cy:open

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	npm run test:license

.PHONY: test-lint
test-lint:
	cd client && $(MAKE) test-lint
	
.PHONY: test-e2e
test-e2e:
	$(TEST_E2E_DOCKER_COMPOSE) up -d
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run

.PHONY: test-e2e-build
test-e2e-build:
	$(TEST_E2E_DOCKER_COMPOSE) build

.PHONY: test-e2e-exec
test-e2e-exec:
	$(TEST_E2E_DOCKER_COMPOSE) exec -T cypress npx cypress run --env "CYPRESS_SNAPSHOT_DIFF_DIR=$(TEST_E2E_IMAGE_SNAPSHOTS_PATH)/__diff_output__"

.PHONY: test-e2e-image-snapshots-clean
test-e2e-image-snapshots-clean:
	rm -rf $(TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH)

.PHONY: test-e2e-image-snapshots-copy
test-e2e-image-snapshots-copy:
	docker cp $(shell $(TEST_E2E_DOCKER_COMPOSE) ps -a -q cypress):$(TEST_E2E_DOCKER_IMAGE_SNAPSHOTS_PATH) $(TEST_E2E_HOST_IMAGE_SNAPSHOTS_PATH)

.PHONY: test-e2e-exec-image-snapshots-update
test-e2e-exec-image-snapshots-update:
	$(TEST_E2E_DOCKER_COMPOSE) exec cypress npx cypress run --env updateSnapshots=true

.PHONY: test-e2e-image-snapshots-update
test-e2e-image-snapshots-update:
	$(MAKE) test-e2e-image-snapshots-clean
	$(MAKE) test-e2e-build
	$(MAKE) test-e2e-up
	$(MAKE) test-e2e-exec-image-snapshots-update
	$(MAKE) test-e2e-image-snapshots-copy

.PHONY: test-e2e-up
test-e2e-up:
	$(TEST_E2E_DOCKER_COMPOSE) up -d