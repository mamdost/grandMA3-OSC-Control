@echo off
start cmd /k "cd client/grandma3-simplecontrol && npm run dev -- --host"
start cmd /k "cd server && node server.js"
exit
