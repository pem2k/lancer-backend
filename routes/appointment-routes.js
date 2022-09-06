const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const bcrypt = require("bcrypt")
const { Developer, Client, Project, Payment, Deadline, Appointment } = require("../models")
const { mail } = require("./nodemailer")

router.post("/", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const newAppointment = await Appointment.create({
            appointment_name: req.body.appointment_name,
            appointment_date: req.body.appointment_date,
            appointment_duration: req.body.appointment_duration,
            description: req.body.description,
            appointment_memo: req.body.appointment_memo,
            developer_id: userData.id,//token id,
            client_id: null
        })

        res.status(200).json(newAppointment)
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error ${err}`)
        }
    }
})

router.put("/", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const foundAppointment = await Appointment.findOne({
            where: {
                appointment_name: req.body.appointment_name
            }
        })
        if (!foundAppointment) {
            return res.status(401).json({ msg: "invalid login credentials" })

        }
        if (!bcrypt.compareSync(req.body.password, foundAppointment.password)) {
            return res.status(401).json({ msg: "invalid login credentials" })
        }
        if (foundAppointment.client_id != null) {
            return res.status(403).json({ msg: "This may be the wrong Appointment, as another client has previously been assigned." })
        }

        await foundAppointment.update({
            client_id: userData.id
        })

        return res.status(200).json(foundAppointment)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.get("/dev", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const allAppointments = await Appointment.findAll({
            where: {
                developer_id: userData.id,
            },
           
                include: [{
                    model: Developer,
                    
                },
                {
                    model: Client,
                    
                },
                { model: Deadline },
                { model: Payment }
                ]
            ,
        })

        return res.status(200).json(allAppointments)
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.get("/client", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const allAppointments = await Project.findAll({
            where: {
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
                include: [{
                    model: Developer,
                    attributes: {exclude: ["password"]}
                }, 
                {
                    model: Client,
                    attributes: {exclude: ["password"]}
                }, 
                {
                    model: Payment
                }, 
                {
                    model: Deadline
                }]
            
            
        })

        return res.status(200).json(allAppointments)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

module.exports = router