// config/ViewEngine.js
const express = require('express');
const path = require('path');

const ConfigViewEngine = (app) => {
    // ensure correct absolute paths
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, '..', 'public')));
};

module.exports = ConfigViewEngine;