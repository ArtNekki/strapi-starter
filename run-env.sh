#!/bin/bash

set -euo pipefail

# Logger function
source ./logger.sh

# Function to display help
show_help() {
  echo "Usage: ./run_env.sh [local|dev|stage|prod]"
  echo "  local - local environment (run via npm)"
  echo "  dev - development environment (run via Docker, uses docker-compose.override.yml)"
  echo "  stage | prod - staging environment (run via Docker, uses docker-compose.yml)"
}

COMPOSE_FILES=()

## Function for cleanup and proper shutdown
cleanup() {
  log "WARNING" "Interrupt signal received. Performing cleanup..."

  case "$ENV" in
  "local")
    log "INFO" "Changing SqliteDB to PostgresDB..."
    mv ./config/database.js ./config/database.local
    mv ./config/database.bkp ./config/database.js
    log "SUCCESS" "Database changed from SqLite to Postgres..."
    ;;
  "dev")
    docker-compose down
    ;;
  *)
    if [ ${#COMPOSE_FILES[@]} -gt 0 ]; then
      docker-compose "${COMPOSE_FILES[@]}" down || true
    fi
    ;;
  esac

  exit 0
}

# Set interrupt handler
trap cleanup SIGINT SIGTERM

# Initialize variables with default values
ENV=""
NODE_ENV=""
CONFIG_NAME=""

# Function to set environment variables
set_environment() {
  case "$1" in
  "local")
    ENV="local"
    NODE_ENV="local"
    CONFIG_NAME="dev_local"
    ;;
  "dev")
    ENV="dev"
    NODE_ENV="development"
    CONFIG_NAME="dev"
    ;;
  "stage")
    ENV="stage"
    NODE_ENV="staging"
    CONFIG_NAME="stage_docker"
    ;;
  "prod")
    ENV="prod"
    NODE_ENV="production"
    CONFIG_NAME="prod_docker"
    ;;
  *)
    log "ERROR" "Invalid environment. Use ./deploy.sh -h for help."
    exit 1
    ;;
  esac
}

# Determine environment based on script argument
if [ "${1-}" = "-h" ] || [ "${1-}" = "--help" ]; then
  show_help
  exit 0
else
  set_environment "${1-}"
fi

# Export vars from the .env file
if [ -f ".env" ]; then
  set -a
  source ".env"
  set +a
else
  log "WARNING" "File .env not found. Using only common environment variables."
fi

# Set
PROJECT_VERSION=${ENV}

# Export vars
export NODE_ENV
export PROJECT_VERSION

# Set Doppler Config
doppler configure set config $CONFIG_NAME

# Load Doppler Secrets
export eval $(doppler secrets download --no-file --format docker  --config "$CONFIG_NAME")

# Run the application based on the environment
if [ "$ENV" = "local" ]; then
  log "INFO" "Running local environment via npm..."
  mv ./config/database.js ./config/database.bkp
  mv ./config/database.local ./config/database.js && log "SUCCESS" "Database changed from Postgres to SqLite..."
  npm run develop
elif [ "$ENV" = "dev" ]; then
  log "INFO" "Running Docker Compose for DEV environment..."
  docker-compose up
else
  # Determine Docker Compose file
  COMPOSE_FILES=("-f" "docker-compose.yml")
  #    if [ "$NODE_ENV" = "production" ] && [ -f docker-compose.prod.yml ]; then
  #        COMPOSE_FILES+=("-f" "docker-compose.prod.yml")
  #    fi
  DOCKERFILE="Dockerfile"

  if [ ! -f "$DOCKERFILE" ]; then
    log "ERROR" "File $DOCKERFILE not found."
    exit 1
  fi

  log "INFO" "Building Docker image for $ENV..."
  docker build \
    --build-arg NODE_ENV="$NODE_ENV" \
    --build-arg STRAPI_URL="${STRAPI_URL}" \
    -t "$DOCKER_USERNAME/$PROJECT_NAME:$PROJECT_VERSION" \
    -f "$DOCKERFILE" .

  log "INFO" "Running Docker Compose for environment $ENV..."

  docker-compose "${COMPOSE_FILES[@]}" up
fi
