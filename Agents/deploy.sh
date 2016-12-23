#!/bin/bash

mkdir femaleAgent
cd femaleAgent
unzip ../femaleAgent.zip
cp scene.json ../../scenes/emma.json
cp -r gerard/* ../../resources/gerard/
cp data/shaders.xml  ../../shaders/shaders.xml
cp js/extra/* ../../kristinajs/
cd ..
rm -rf femaleAgent

