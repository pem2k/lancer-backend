const Client = require("./Client")
const Developer = require("./Developer")
const Deadline = require("./Deadline")
const Payment = require("./Payment")
const Project = require("./Project")

Developer.hasMany(Project, {
    foreignKey: "dev_id"
})
Project.belongsTo(Developer, {
    foreignKey:"dev_id"
})


Client.hasOne(Project, {
    foreignKey:"client_id"
})
Project.belongsTo(Client, {
    foreignKey:"client_id"
})


Project.hasMany(Deadline, {
    foreignKey:"project_id"
})
Deadline.belongsTo(Project, {
    foreignKey: "project_id"
})


Project.hasMany(Payment, {
    foreignKey:"project_id"
})
Payment.belongsTo(Project, {
    foreignKey:"project_id"
})

module.exports = { Developer, Client, Project, Deadline, Payment }
