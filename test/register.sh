#!/bin/sh
curl -i -X POST -H 'Content-Type: application/json' -d '{
              "lname": "Snow",
              "fname": "Jon",
              "address": "nowhere",
              "city": "winterfell",
              "state":"NR",
              "zip":"12345",
              "email": "JonSnow@aws.com",
              "username": "jadmin",
              "password": "fawefhoai"}' http://localhost:8082/registerUser
