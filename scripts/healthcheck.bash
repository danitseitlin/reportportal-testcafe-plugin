#!/bin/bash
#set -eux
#
#wait-for-status() {
#    echo "Waiting for services status"
#    echo ""
#    bash -c \
#    'while [[ "$(npm run status)" == *"(starting)"* ]];\
#    do echo "Waiting for services" && sleep 30;\
#    done'
#}
#wait-for-status

while true; do
  # Run the command and capture the output
  output=$(npm run status)

  # Check if the output contains 'starting' or 'exited'
  if echo "$output" | grep -q -e "starting" -e "exited"; then
    echo "Detected 'starting' or 'exited' in the output. Sleeping for 2 seconds..."
    sleep 2
  else
    echo "No 'starting' or 'exited' found in the output. Continuing..."
    break
  fi
done