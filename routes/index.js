const router = require('express').Router();
const developerRoutes = require("./developer-routes")
// const clientRoutes = require("./client-routes")
const projectRoutes = require("./project-routes")
const bcrypt = require("bcrypt");

const {Developer, Client, Project, Payment, Project } = require("../models")

router.use('/developers', developerRoutes);
// router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);



module.exports = router

