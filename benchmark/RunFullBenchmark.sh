#!/bin/bash

####################
# CONSTS
####################

BASE_DIR=$(pwd)
FRAMEWORKS_DIR="$BASE_DIR/../frameworks"
RESULTS_DIR="$BASE_DIR/../results-json"


####################
# GLOBALS
####################

SERVER_PID=0

####################
# METHODS
####################

FnLog() {
  echo "----------------------------------------------------------"
  echo "[LOG] $1"
  echo "----------------------------------------------------------"
}

FnClearDependencies () {
  FnLog "Cleaning $(basename $1) appdependencies"
  rm -rf "$1/node_modules" "$1/yarn.lock" "$1/package-lock.json"
}

FnInstallDependencies () {
    FnLog "Installing $(basename $1) app dependencies"
    cd $1
    npm install
    cd $BASE_DIR
}

FnConstructBuild () {
    FnLog "Building $(basename $1) app for production"
    cd $1
    npm run build:prod
    cd $BASE_DIR
}

FnRunHTTPServer () {
    FnLog "Running HTTP server for $(basename $1) app"
    cd $1
    npm run start:server -- --gzip > /dev/null &
    SERVER_PID="$!"
    cd $BASE_DIR
}

FnRunBenchmark () {
    FnLog "Running benckmark for $1 app"
    cd $BASE_DIR
    npm run start:bench -- --androidBench=true --framework $1
}

####################
# MAIN
####################

Main () {
  for framework in  $FRAMEWORKS_DIR/*; do
#    FnClearDependencies   $framework
#    FnInstallDependencies $framework
    FnConstructBuild      $framework
    FnRunHTTPServer       $framework
    FnRunBenchmark        $(basename $framework)
    kill "$SERVER_PID" > /dev/null
  done
}

Main
