require("dotenv").config
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const path = require("path")
const bcrypt = require("bcrypt")

const {Developer, Client, Deadline, Payment, Project } = require("../models")


router.post("/signup", async(req, res) => {
    try{
        const newUser = await Developer.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone, //optional
            password: req.body.password,
        })

        const token = jwt.sign({newUser}, process.env.JWT_SECRET, {expiresIn: "2h"})

        return res.status(200).json({token:token})
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.get("/all", async (req, res) =>{
    const allDev = await Developer.findAll()
    res.status(200).json(allDev)
})

router.post("/login", async(req, res) => {
    try{
        const foundUser = await Developer.findOne({
            where:{
                email: req.body.email
            },
        })
        if (!foundUser) {
            return res.status(401).json({ msg: "invalid login credentials" })
    
        }
        if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
            return res.status(401).json({ msg: "invalid login credentials" })
        }

        const token = jwt.sign({foundUser}, process.env.JWT_SECRET, {expiresIn: "2h"})
        
        return res.status(200).json({token: token})
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

const tokenAuth = (req, res, next) => {
    
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401)
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) =>{
        if(err){return res.status(403)}
    })
}

router.get("/home", tokenAuth, async(req, res) => {
    try{
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const devData = await Developer.findOne({
            where: {
                id: userData.id
            },
            include: [{
                model: Project,
                include:[Client, Deadline, Payment]
            }],
        })
        return res.status(200).json(devData)
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})



router.delete("/logout", async (req, res) => {

})



module.exports = router