const router = require('express').Router();
const developerRoutes = require("./developer-routes")
const clientRoutes = require("./client-routes")
const projectRoutes = require("./project-routes")
const appointmentRoutes = require("./appointment-routes")

router.use('/developers', developerRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/appointments', appointmentRoutes)

module.exports = router

