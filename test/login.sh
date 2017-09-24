#!/bin/sh

curl -i -X POST -H 'Content-Type: application/json' -d '{
              "username": "jadmin",
              "password": "admin"}' http://localhost:8082/login
