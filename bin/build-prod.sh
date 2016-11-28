#!/bin/bash
git checkout app/api.js
jspm unbundle
jspm bundle app/exercises --inject --minify
git add build*
