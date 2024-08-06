#!/bin/bash

# Logger function
source ./logger.sh

# Check if config is provided
if [ $# -eq 0 ]; then
  log "ERROR" "Config is not set. Usage: $0 <config> [options]"
  exit 1
fi

# Set config and shift arguments
CONFIG="$1"
shift

# Predefined settings
SOURCE_CONTAINER="strapi_starter_strapi_1"
TARGET_CONTAINER="app-strapi-1"
SSH_HOST=$(doppler secrets get SSH_HOST --plain --config "$CONFIG")
SSH_KEY="~/.ssh/id_rsa"
EXPORT_FILE_NAME="dev_export"
EXPORT_FILE="${EXPORT_FILE_NAME}.tar.gz"
SSH_PORT="22"
MAX_RETRIES=3
RETRY_DELAY=10

# Default Strapi export options
NO_ENCRYPT="--no-encrypt" # Set --no-encrypt as default
NO_COMPRESS=""
ENCRYPTION_KEY=""
ONLY=""
FILE_OPTION="--file $EXPORT_FILE_NAME"

# Function to display usage information
usage() {
  echo "Usage: $0 <config> [options]"
  echo
  echo "Options:"
  echo "  --encrypt             Enable encryption (disabled by default)"
  echo "  --key                 Specify encryption key (required if encryption is enabled)"
  echo "  --no-compress         Disable compression (enabled by default)"
  echo "  --only                Export only specified data types (comma-separated: content,files,config)"
  echo "  --file                Specify the name of the export file (default: $EXPORT_FILE)"
  echo "  --help                Display this help message"
  echo
  echo "Examples:"
  echo "  1. Basic export (no encryption by default):"
  echo "     $0 prod"
  echo
  echo "  2. Export with encryption:"
  echo "     $0 prod --encrypt --key my-encryption-key"
  echo
  echo "  3. Export without compression:"
  echo "     $0 prod --no-compress"
  echo
  echo "  4. Export only specific data types:"
  echo "     $0 prod --only content,files"
  echo
  echo "  5. Full example with encryption and custom file name:"
  echo "     $0 prod --encrypt --key my-encryption-key --no-compress --only content,config --file custom_export.tar"
  echo
  echo "Note: Encryption is disabled by default. Use --encrypt to enable it, and provide a key with --key."
  exit 1
}

# Parsing command line arguments for Strapi export options
while [[ "$#" -gt 0 ]]; do
  case $1 in
  --encrypt) NO_ENCRYPT="" ;; # Remove --no-encrypt if --encrypt is specified
  --key)
    ENCRYPTION_KEY="--key $2"
    shift
    ;;
  --no-compress) NO_COMPRESS="--no-compress" ;;
  --only)
    ONLY="--only $2"
    shift
    ;;
  --file)
    FILE_OPTION="--file $2"
    EXPORT_FILE_NAME="$2"
    shift
    ;;
  --help) usage ;;
  *)
    echo "Unknown parameter passed: $1"
    usage
    ;;
  esac
  shift
done

# Validate encryption key if encryption is enabled
if [[ -z "$NO_ENCRYPT" && -z "$ENCRYPTION_KEY" ]]; then
  echo "Error: Encryption key is required when encryption is enabled."
  usage
fi

# Error handling function
handle_error() {
  log "ERROR" "$1"
  exit 1
}

# Cleanup function
cleanup() {
  log "INFO" "Performing cleanup..."
  rm -f "$EXPORT_FILE"
  log "INFO" "Cleanup completed."
}

# Interrupt handler
trap cleanup EXIT
trap 'log "ERROR" "Script was interrupted"; exit 1' INT TERM

# Function for retrying commands
retry_command() {
  local cmd="$1"
  local retries=0
  until $cmd || [ $retries -eq $MAX_RETRIES ]; do
    retries=$((retries + 1))
    log "WARN" "Attempt $retries of $MAX_RETRIES failed. Retrying in $RETRY_DELAY seconds..."
    sleep $RETRY_DELAY
  done
  if [ $retries -eq $MAX_RETRIES ]; then
    return 1
  fi
}

# Function to check server availability
check_server_availability() {
  if command -v nc >/dev/null; then
    nc -z -w 5 "$SSH_HOST" "$SSH_PORT"
  else
    ping -c 1 -W 5 "$SSH_HOST" >/dev/null 2>&1
  fi
}

remote_operations() {
  log "INFO" "Starting operations on the remote server..."

  # Copying file to remote server
  if ! scp -i "$SSH_KEY" -P "$SSH_PORT" "$EXPORT_FILE" "root@$SSH_HOST:/tmp/$EXPORT_FILE"; then
    log "ERROR" "Failed to copy file to remote server"
    return 1
  fi

  # Performing operations on remote server
  if ! ssh -i "$SSH_KEY" -p "$SSH_PORT" root@"$SSH_HOST" <<EOF; then
        set -e

        # Checking free space
        FREE_SPACE=\$(df -k /tmp | tail -1 | awk '{print \$4}')
        if [ \$FREE_SPACE -lt 1048576 ]; then
            echo 'Not enough free disk space' >&2
            exit 1
        fi

        # Backing up current data
        if ! docker exec $TARGET_CONTAINER /bin/sh -c 'strapi export --no-encrypt -f backup_file'; then
            echo 'Failed to create backup' >&2
            exit 1
        fi

        # Copying backup file from target container
        if ! docker cp "$TARGET_CONTAINER:/opt/app/backup_file.tar.gz" ./; then
            echo 'Failed to copy file from container' >&2
            exit 1
        fi

        # Copying file to target container
        if ! docker cp /tmp/$EXPORT_FILE $TARGET_CONTAINER:/opt/app/$EXPORT_FILE; then
            echo 'Failed to copy file to container' >&2
            exit 1
        fi
        rm /tmp/$EXPORT_FILE

        # Importing data
        if ! docker exec $TARGET_CONTAINER /bin/sh -c 'strapi import -f $EXPORT_FILE --force'; then
            echo 'Failed to perform import' >&2
            exit 1
        fi
        echo 'Import completed.'

        # Removing export file from target container
        if ! docker exec $TARGET_CONTAINER /bin/sh -c 'rm /opt/app/$EXPORT_FILE'; then
            echo 'Failed to remove export file from container' >&2
            exit 1
        fi

        echo "All operations on remote server completed successfully"
EOF

    log "ERROR" "An error occurred while performing operations on the remote server"
    return 1
  fi

  log "SUCCESS" "Operations on remote server completed successfully"
  return 0
}

# Main script logic
main() {
  log "INFO" "Starting data migration process for config: $CONFIG"

  # 1. Exporting data from source environment
  log "INFO" "Exporting data from source environment..."
  EXPORT_CMD="strapi export $NO_ENCRYPT $NO_COMPRESS $ENCRYPTION_KEY $ONLY $FILE_OPTION"
  if ! docker exec "$SOURCE_CONTAINER" /bin/sh -c "$EXPORT_CMD"; then
    handle_error "Failed to perform export"
  fi
  if ! docker cp "$SOURCE_CONTAINER:/opt/app/$EXPORT_FILE" ./; then
    handle_error "Failed to copy export file"
  fi

  # 2. Copying data to docker container on remote server and importing
  log "INFO" "Copying data and importing on remote server..."

  # Checking server availability
  if ! check_server_availability; then
    handle_error "Server $SSH_HOST is not accessible"
  fi

  # Performing operations on remote server with retries
  if ! retry_command remote_operations; then
    handle_error "An error occurred while executing commands on the remote server after $MAX_RETRIES attempts"
  fi

  log "SUCCESS" "All operations completed successfully"
}

# Executing main logic
main

log "SUCCESS" "Data migration completed successfully for config: $CONFIG"
