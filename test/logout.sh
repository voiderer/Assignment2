#!/bin/sh

curl -i --cookie "req.cookie_project2.login = true" -X POST http://localhost:8082/logout
