#!/bin/bash
set -eux

wait-for-status() {
    echo "Waiting for services status"
    echo ""
    bash -c \
    'while [[ "$(npm run status)" == *"(Exited)"* ]];\
    do echo "Waiting for services" && sleep 2;\
    done'
}
wait-for-status