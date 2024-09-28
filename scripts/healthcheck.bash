#!/bin/bash
set -eux

wait-for-status() {
    echo "Waiting for services status"
    echo ""
    bash -c \
    'while [[ "$(npm run status)" == *"(starting)"* ]];\
    do echo "Waiting for services" && sleep 30;\
    done'
}
wait-for-status