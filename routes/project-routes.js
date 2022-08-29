const express = require("express");
const router = express.Router()
const path = require("path")
const {Developer, Client, Project, Payment, Project } = require("../models")

router.route("/projects").get().post().put()

//all projects - for dev
    router.get("/", async(req, res) => {
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

    router.post("/", async(req, res) => {
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
    
    router.put("/",async(req, res) => {
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

//singular projects by id
    router.get("/:id", async(req, res) => {
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

    router.put("/:id", async(req, res) => {
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

router.get("/deadlines", async(req, res) => {
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
        const newUser = await Developer.create({

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
        const newUser = await Developer.create({

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
        const newUser = await Developer.create({

        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})


module.exports = router