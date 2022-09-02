const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const bcrypt = require("bcrypt")
const { Developer, Client, Project, Payment, Deadline } = require("../models")
const { mail } = require("./nodemailer")


//all projects - for dev

router.post("/", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const newProject = await Project.create({
            project_name: req.body.project_name,
            project_status: req.body.project_status,
            initial_charge: req.body.initial_charge,
            balance: req.body.balance,
            password: req.body.password,
            developer_id: userData.id,//token id,
            client_id: null
        })

        res.status(200).json(newProject)
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
        const foundProject = await Project.findOne({
            where: {
                project_name: req.body.project_name
            }
        })
        if (!foundProject) {
            return res.status(401).json({ msg: "invalid login credentials" })

        }
        if (!bcrypt.compareSync(req.body.password, foundProject.password)) {
            return res.status(401).json({ msg: "invalid login credentials" })
        }
        if (foundProject.client_id != null) {
            return res.status(403).json({ msg: "This may be the wrong project, as another client has previously been assigned." })
        }

        await foundProject.update({
            client_id: userData.id
        })

        return res.status(200).json(foundProject)

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
        const allProjects = await Project.findAll({
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

        return res.status(200).json(allProjects)
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
        const allProjects = await Project.findAll({
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

        return res.status(200).json(allProjects)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})


//auth that allows clients to join the project
router.post("/deadlines", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                id: req.body.project_id
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Client,
                attributes: {exclude: ["password"]}
            }]
        })

        if (permCheck.developer_id != userData.id) {
            return res.status(403).json("You are not the developer assigned to this project")
        }

        const newDeadline = await Deadline.create({
            completion_date: req.body.completion_date,
            deliverable: req.body.deliverable,
            priority: req.body.priority,
            project_id: req.body.project_id
        })

        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `New Deadline Created for ${permCheck.project_name}: ${newDeadline.completion_date}`,`${newDeadline.deliverable}`)
        
        res.status(200).json(newDeadline)
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.put("/deadlines", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                id: req.body.project_id,
                developer_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Client,
                attributes: {exclude: ["password"]}
            }]
        })

        if (permCheck.developer_id != userData.id || userData.type == "client") {
            return res.status(403).json("You are not the developer assigned to this project")
        }

        const deadlineUpdate = await Deadline.findOne({
            where: {
                id: req.body.id,
                project_id: permCheck.id,
            }
        })

        await deadlineUpdate.update({ completed: true })
        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `Deliverable complete for: ${permCheck.project_name}: ${deadlineUpdate.completion_date}`,`${deadlineUpdate.deliverable}`)
        res.status(200).json(deadlineUpdate)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.post("/invoices", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                project_name: req.body.project_name,
                developer_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Client,
                attributes: {exclude: ["password"]}
            }]
        })

        if (permCheck.developer_id != userData.id) {
            return res.status(403).json("You are not the developer assigned to this project")
        }

        const newInvoice = await Payment.create({
            payment_date: req.body.payment_date,
            payment_sum: req.body.payment_sum,
            project_id: req.body.project_id
        })

        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `New invoice for: ${permCheck.project_name}`,`
            due: ${newInvoice.payment_date}, 
            amount: ${newInvoice.payment_sum}`)

        res.status(200).json(newInvoice)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.put("/invoices", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                id: req.body.project_id,
                developer_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include:{
                model: Client, 
                attributes: {exclude: ["password"]}
            }
        })

        if (permCheck.developer_id != userData.id) {
            return res.status(403).json("You are not the developer assigned to this project")
        }

        const invoiceUpdate = await Payment.findOne({
            where: {
                project_id: permCheck.id,
            }
        })

        await invoiceUpdate.update({ paid: true })
        await permCheck.update({ balance: permCheck.balance - invoiceUpdate.paymentSum })

        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `Invoice paid for: ${permCheck.project_name}`,`
        due: ${invoiceUpdate.payment_date}, 
        amount: ${invoiceUpdate.payment_sum}
        project balance: ${permCheck.balance}`)

        res.status(200).json(invoiceUpdate)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})



module.exports = router