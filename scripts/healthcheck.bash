#!/bin/bash
set -eux

wait-for-status() {
    echo "Waiting for services status"
    echo ""
    bash -c \
    'while [[ "$(npm run status)" == *"(starting)"* -o "$(npm run status)" == *"(Exited)"* ]];\
    do echo "Waiting for services" && sleep 2;\
    done'
}
wait-for-status