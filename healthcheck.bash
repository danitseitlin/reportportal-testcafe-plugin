#!/bin/bash
set -eux

declare -r HOST="localhost"
timeout() {

    time=$1

    # start the command in a subshell to avoid problem with pipes
    # (spawn accepts one command)
    command="/bin/sh -c \"$2\""

    expect -c "set echo \"-noecho\"; set timeout $time; spawn -noecho $command; expect timeout { exit 1 } eof { exit 0 }"    

    if [ $? = 1 ] ; then
        echo "Timeout after ${time} seconds"
    fi

}
wait-for-url() {
    echo "Testing $1"
    bash -c \
    'echo "Waiting for ${0} $(curl -s -o /dev/null -L -w ''%{http_code}'' ${0})";\
    while [[ "$(curl -s -o /dev/null -L -w ''%{http_code}'' ${0})" != "200" ]];\
    do echo "Waiting for ${0} $(curl -s -o /dev/null -L -w ''%{http_code}'' ${0})" && sleep 2;\
    done' ${1}
    
    echo "OK!"
    curl -I $1
}

wait-for-status() {
    echo "Waiting for services status"
    echo ""
    bash -c \
    'while [[ "$(npm run status)" == *"(starting)"* ]];\
    do echo "Waiting for services" && sleep 2;\
    done'
}
wait-for-status