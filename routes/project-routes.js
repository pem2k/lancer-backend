const express = require("express");
const { TokenExpiredError } = require("jsonwebtoken");
const router = express.Router()
const path = require("path")
const {Developer, Client, Project, Payment, Deadline } = require("../models")

router.route("/projects").get().post().put()

//all projects - for dev
    router.get("/", async(req, res) => {
        try{
            const allProjects = await Project.findAll({
                // where:{
                //     developer_id: null //dev_id , 
                // }
                include: [Developer, Client, Payment, Deadline]
            })

            return res.status(200).json(allProjects)
        }catch(err) {
            if(err){
                console.log(err)
                res.status(500).json("Internal server error")
            }
        }
    })

    router.post("/", async(req, res) => {
        const token = req.headers.authorization.split(" ")[1]
        try{
            const newProject = await Project.create({
                project_name: req.body.project_name,
                project_status: req.body.project_status,
                initial_charge: req.body.initial_charge,
                balance: req.body.balance,
                password: req.body.password,
                developer_id: token.id,//token id,
                client_id: null
            })



        }catch(err) {
            if(err){
                console.log(err)
                res.status(500).json("Internal server error")
            }
        }
    })
    
    // router.put("/",async(req, res) => {
    //     try{
    //         const newUser = await Project.findOneAndUpdate({
    
    //         })
    //     }catch(err) {
    //         if(err){ 
    //             console.log(err)
    //             res.status(500).json("Internal server error")
    //         }
    //     }
    // })

//singular projects by id
    router.get("/:id", async(req, res) => {
        try{
            const foundProject = await Project.findOne({
                where:{
                    id: req.params.id
                }
            })

            return res.status(200).json(foundProject)

        }catch(err) {
            if(err){
                console.log(err)
                res.status(500).json("Internal server error")
            }
        }
    })

    router.put("/:id", async(req, res) => {
        try{
            const foundProject = await Project.findOneAndUpdate({
                where:{
                    id: req.params.id
                }
            })

            return res.status(200).json(foundProject)

        }catch(err) {
            if(err){
                console.log(err)
                res.status(500).json("Internal server error")
            }
        }
    })

router.get("/deadlines", async(req, res) => {
    try{
        const foundDeadlines = await Deadline.findAll({

        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})
router.post("/deadlines", 
async(req, res) => {
    try{
        const newUser = await Developer.create({

        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})
//router.put("/deadlines")

router.get("/invoices", async(req, res) => {
    try{
        const allProjects = await Project.findAll({
            where:{
                developer_id: null //dev_id , 
            },
            include: [Deadline, Client]
        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.post("/invoices",
async(req, res) => {
    try{
        const newUser = await Payment.create({

        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.put("/invoices", async(req, res) => {
    try{
        const allProjects = await Project.findAll({
            where:{
                developer_id: null //dev_id , 
            },
            include: [Payment, Client]
        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})


module.exports = router