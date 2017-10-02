#!/bin/sh
curl -i -X POST -H 'Content-Type: application/json' -d '{
              "keyword": "Sound",
              "group": "DVD"}' http://localhost:8082/viewProducts
