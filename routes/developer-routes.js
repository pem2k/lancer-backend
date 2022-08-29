const express = require("express");
const router = express.Router()
const path = require("path")
const {Developer, Client, Project, Payment, Project } = require("../models")


router.post("/signup", async(req, res) => {
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

router.post("/login", async(req, res) => {
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

router.get("/home", async(req, res) => {
    try{
        const devData = await Developer.findOneByPk({

        })
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.delete("/logout")

module.exports = router