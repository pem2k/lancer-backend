const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const {Developer, Project, Payment, Project } = require("../models")
const jwt = require("jsonwebtoken")