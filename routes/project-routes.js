const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const bcrypt = require("bcrypt")
const { Developer, Client, Project, Payment, Deadline, Appointment } = require("../models")
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

router.get("/:id", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const foundProject = await Project.findOne({
            where: {
                id: req.params.id
            },
            attributes: { exclude: ["password"] },
            include: [
            {model: Developer, attributes: { exclude: ["password"] }},
            {model: Client, attributes: { exclude: ["password"] }}, 
            { model: Deadline }, 
            { model: Payment }]
        })
        if (!foundProject || foundProject.developer_id != userData.id && foundProject.client_id !=userData.id) {
            return res.status(404).json({ msg: "Project not found" })
        }

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


//-----------------------------------------------------//
//-                                                   -//
//-                                                   -//
//                 DEADLINE SECTION                    //
//-                                                   -//
//-                                                   -//
//-----------------------------------------------------//


router.post("/deadlines", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                id: req.body.project_id,
                developer_id: userData.id
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

router.get("/deadlines/developers", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                developer_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Deadline,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
})

router.get("/deadlines/clients", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Deadline,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
    })
    
//-----------------------------------------------------//
//-                                                   -//
//-                                                   -//
//                APPOINTMENT SECTION                  //
//-                                                   -//
//-                                                   -//
//-----------------------------------------------------//

router.post("/appointments", async (req, res) => {
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

        if (permCheck.client_id != userData.id) {
            return res.status(403).json("You are not the client assigned to this project")
        }

        const newAppointment = await Appointment.create({
            appointment_name: req.body.appointment_name,
            appointment_date: req.body.appointment_date,
            appointment_time: req.body.appointment_time,
            appointment_duration: req.body.appointment_duration,
            appointment_location: req.body.appointment_location,
            description: req.body.description,
            appointment_memo: req.body.appointment_memo,
            developer_id: null,//token id,
            client_id: userData.id,
        })

        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `New Appointment Created for ${permCheck.project_name}: On ${newAppointment.appointment_date} at ${newAppointment.appointment_time} and location of ${newAppointment.appointment_location} Full Details: ${newAppointment.appointment_memo}`)
        
        res.status(200).json(newAppointment)
    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.put("/appointments", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findOne({
            where: {
                id: req.body.project_id,
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Client,
                attributes: {exclude: ["password"]}
            }]
        })

        if (permCheck.client_id != userData.id || userData.type == "client") {
            return res.status(403).json("You are not the client assigned to this project")
        }

        const appointmentUpdate = await Appointment.findOne({
            where: {
                id: req.body.id,
                project_id: permCheck.id,
            }
        })

        await appointmentUpdate.update({ completed: true })
        await mail(userData.first_name, userData.last_name, permCheck.Client.email, `Appointment for: ${permCheck.project_name}: ${appointmentUpdate.appointment_date} at ${appointmentUpdate.appointment_time} and location of ${newAppointment.appointment_location} Full Detals: ${appointmentUpdate.appointment_memo}`)
        res.status(200).json(appointmentUpdate)

    } catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.get("/appointments/developers", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Appointment,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
})

router.get("/appointments/clients", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Appointment,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
    })



    
//-----------------------------------------------------//
//-                                                   -//
//-                                                   -//
//                  INVOICE SECTION                    //
//-                                                   -//
//-                                                   -//
//-----------------------------------------------------//



router.get("/invoices/developers", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                developer_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Payment,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
})

router.get("/invoices/clients", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const permCheck = await Project.findAll({
            where: {
                client_id: userData.id,
            },
            attributes: {exclude: ["password"]},
            include: [{
                model: Payment,
            }]
        })

        res.status(200).json(permCheck)
    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }}
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
        console.log(req.body)
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

        

        const invoiceUpdate = await Payment.update({paid: true},
           {where: {
                project_id: req.body.project_id,
                id: req.body.id
            },
            
        })

        const newinvoiceUpdate = await Payment.findOne({
            where: {
                project_id: req.body.project_id,
                id: req.body.id
            },
        })
        const newNum = await permCheck.balance - newinvoiceUpdate.payment_sum
        
        await permCheck.update({ balance: newNum })

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