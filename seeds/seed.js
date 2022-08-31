const sequelize = require("../config/connection");

const {Developer, Client, Project, Payment, Deadline } = require("../models")

const developers = [
    {
        id: 1,
        first_name: "Parker",
        last_name: "McKillop",
        email: "mckilpar000@hotmail.com",
        password: "password",
        phone: "425-931-9564",
        type: "developer"
},
    { 
        id: 2,
        first_name: "Chris",
        last_name: "Le",
        email: "chris@chris.com",
        password: "password",
        phone: "425-111-1111",
        type: "developer"
    }
]

const clients = [
    {
        id: 1,
        first_name: "Vincent",
        last_name: "Tate",
        email: "parkermwebdev@outlook.com",
        password: "password",
        phone: "425-222-2222",
        type: "client"
    },
    {
        id: 2,
        first_name: "Leslie",
        last_name: "Saucedo",
        email: "leslie@leslie.com",
        password: "password",
        phone: "425-333-3333",
        type: "client"
    }
]

const projects = [
    {
        id: 1,
        project_name: "Test Project",
        project_status: "find a way to quantify status",
        initial_charge: 500,
        balance: 500,
        password: "password",
        developer_id: 1,
        client_id: 1
    },
    { id: 2,
        project_name: "Test Project 2",
        project_status: "find a way to quantify status",
        initial_charge: 1000,
        balance: 1000,
        password: "password",
        developer_id: 2,
        client_id: 2
    }
]

const payments = [
    {
        id: 1,
        payment_date: 2022-01-17,
        payment_sum: 100,
        project_id: 1
    },
    {
        id: 2,
        payment_date: 2022-01-22,
        payment_sum: 1000,
        project_id: 1
    },
    {
        id: 3,
        payment_date: 2022-01-17,
        payment_sum: 100,
        project_id: 2},
    {
        id: 4,
        payment_date: 2022-01-22,
        payment_sum: 1000,
        project_id: 2},
]

const deadlines  = [
    {
        id: 1,
        completion_date:2022-01-17,
        deliverable:"New navbar",
        priority:5,
        project_id: 1
    },
    {
        id: 2,
        completion_date:2022-01-18,
        deliverable:"New server",
        priority:4,
        project_id: 1
    },
    {
        id: 3,
        completion_date:2022-01-20,
        deliverable:"New about section",
        priority:3,
        project_id: 2
    },
    {
        id: 4,
        completion_date:2022-01-25,
        deliverable:"New Page",
        priority:1,
        project_id: 2
    },
]

const seedMe = async () => {
    await sequelize.sync({force:true});
    await Developer.bulkCreate(developers,{individualHooks:true});
    await Client.bulkCreate(clients,{individualHooks:true});
    await Project.bulkCreate(projects, {individualHooks:true});
    await Payment.bulkCreate(payments);
    await Deadline.bulkCreate(deadlines);
    process.exit(0)
}

seedMe()