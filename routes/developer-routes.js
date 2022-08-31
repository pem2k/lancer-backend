require("dotenv").config
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const bcrypt = require("bcrypt")


const {Developer, Client, Deadline, Payment, Project } = require("../models")


router.post("/signup", async(req, res) => {
    try{
        await Developer.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone, //optional
            password: req.body.password,
            type: "developer"
        })

        const foundUser = await Developer.findOne({
            where:{
                email: req.body.email
            },
        })

        const token = jwt.sign({
            id: foundUser.id, 
            first_name: foundUser.first_name, 
            last_name: foundUser.last_name, 
            email: foundUser.email,
            type: foundUser.type
        }, process.env.JWT_SECRET, {expiresIn: "2h"})

        return res.status(200).json({token:token})

    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.get("/all", async (req, res) =>{
    const allDev = await Developer.findAll({
        include:  [Project]})
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

        const token = jwt.sign({
            id: foundUser.id, 
            first_name: foundUser.first_name, 
            last_name: foundUser.last_name, 
            email: foundUser.email
        }, process.env.JWT_SECRET, {expiresIn: "2h"})
        
        return res.status(200).json({token: token})

    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json("Internal server error")
        }
    }
})

router.get("/home", async(req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try{
        const userData = jwt.verify(token,process.env.JWT_SECRET)
        const devData = await Developer.findOne({
            where: {
                id: userData.id
            },
            include: [{
                model: Project,
                include: [{
                    model: Client,
                    attributes: ["first_name, last_name, email, address, phone"]
                },
                {model: Deadline},
                {model: Payment}
                ]
            }],
        })
        return res.status(200).json(devData)
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.delete("/logout", async (req, res) => {
    res.cookie("jwt", "", {maxAge: 1}).redirect("/")
})



module.exports = router