require("dotenv").config
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router()
const bcrypt = require("bcrypt")


const {Developer, Client, Deadline, Payment, Project } = require("../models")


router.post("/signup", async(req, res) => {
    try{
        const newUser = await Client.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone, //optional
            password: req.body.password,
            type: "client"
        })

        const foundUser = await Client.findOne({
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
    const allDev = await Client.findAll({
        include:  [Project]
})
    res.status(200).json(allDev)
})

router.post("/login", async(req, res) => {
    
    try{
        const foundUser = await Client.findOne({
            where:{
                email: req.body.email
            }
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
        const clientData = await Client.findOne({
            where: {
                id: userData.id
            },
            include: [{
                model: Project,
                attributes: {exclude: ["password"]},
                include: [{
                    model: Developer,
                    attributes: {exclude: ["password"]}
                }, 
                {
                    model: Payment
                }, 
                {
                    model: Deadline
                }]
            }],
        })
        return res.status(200).json(clientData)
    }catch(err) {
        if(err){
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})

router.put("/settings", async (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
   
    try {
        
        const userData = jwt.verify(token, process.env.JWT_SECRET)

        if(userData.type == "developer"){
            return res.status(403).json("Client only")
        }

        const clientData = await Client.update(req.body, {
            where: {
                id: userData.id
            }
        })

        res.status(200).json(clientData)

    }catch (err) {
        if (err) {
            console.log(err)
            res.status(500).json(`Internal server error: ${err}`)
        }
    }
})


router.delete("/logout", async (req, res) => {
    res.cookie("jwt", "", {maxAge: 1}).redirect("/")
})



module.exports = router