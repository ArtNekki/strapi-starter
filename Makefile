include .env

export SERVER_IP \
	   DOMEN_NAME \
       DOCKER_USERNAME \
       PROJECT_NAME \
       PROJECT_VERSION \
       SSH_KEY_PATH

dev:
	docker-compose -f docker-compose.yml up

down:
	docker-compose down

build-prod:
	docker build \
	--build-arg NODE_ENV=production \
	--build-arg STRAPI_URL=${DOMEN_NAME} \
	-t ${DOCKER_USERNAME}/${PROJECT_NAME}:${PROJECT_VERSION} \
	-f Dockerfile.prod .

prod:
	docker-compose -f docker-compose.prod.yml up


copy-to-vps:
	scp -i ${SSH_KEY_PATH} .env root@${SERVER_IP}:/root/${PROJECT_NAME}

connect-to-vps:
	ssh -i ${SSH_KEY_PATH} root@${SERVER_IP}