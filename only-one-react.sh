#!/bin/bash
find . -name 'react' | grep 'node_modules\/react' | grep -v '\.\/node_modules\/react$' | xargs rm -rf
