//Declare dependencies

const express = require('express');
const app= express(); 
const mysql = require('mysql2');
const dotenv= require('dotenv');
const cors = require('cors');
const path = require ('path');


app.use(express.json());
app.use(cors());
dotenv.config();

//Connecting to the database
const db= mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME 
});

//Check if the database is connected
db.connect((err)=>{
    //If not connected
    if(err)
        return console.log("Error connecting to database");
    //If connected
    console.log("Connected to the database sucessfully as id:", db.threadId);
})
//Getting data from the database
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, '/views'));
//Question One: Patient's Endpoint. Patients is the file name

app.get('/patients', (req,res)=>{
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, results) =>{
        if(err){
            console.error(err);
            res.status(500).send('Error retrieving data from Patients file')
        }else{
            //Display the patients records
            res.render('patients', {results:results});
        }
    });
});

    //Question Two: Providers is the file name
app.get('/providers', (req,res)=>{
    db.query('SELECT first_name, last_name, provider_specialty FROM providers', (err,results) =>{
        if (err){
            console.error(err);
            res.status(500).send('Error retrieving data from Providers file')
        } else{
            //Display provider records
    
            res.render('providers', {results:results});
        }
    });
});

//Question Three: filter by First Name
app.get('/patients/filter', (req,res)=>{
    const{first_name}= req.query 
    //Check if this exists
    if(!first_name){
        return res.status(400).send('Please provide a first name to filter patients by');
    }

    //The actual SQL query
    const sqlQuery = 'SELECT * FROM patients WHERE first_name =?';
    db.query(sqlQuery, [first_name], (err, results) => {
        if(err){
            console.error('Error filtering patients:', err);
            return res.status(500).send('Error retrieving filtered patients data');
        }
        //Return the results
        if (results.length >0){
            res.render('patients', {results:results});
        }else{
            res.send("No patients found with this first name");
        }
    });
});

//Question Four: Filter the providers by specialty
app.get('/providers/filter', (req,res)=>{
    const{provider_specialty}=req.query
    //Again, checking if the provider has a specialty
    if(!provider_specialty){
        return res.status(400).send('Please provide a specialty to filter by');
    }

    //The query
    const sqlQuery= 'SELECT * FROM providers WHERE provider_specialty =?';
        db.query(sqlQuery, [provider_specialty], (err,results)=>{
            if(err){
                console.error('Error filtering providers', err);
                return res.status(500).send('Error retrieving provider specialty data');
            }

    //Return filtered results
    if(results.length>0){
        res.render('providers', {results:results});
    }else{
        res.send("No providers with this specialty");
    }
    });
});
//The server starts
app.listen(process.env.PORT, ()=>{
    console.log(`Server listening on port ${process.env.PORT}`);
    //Sending a message to the browser
    console.log(`Sending message to browser...`);
    app.get('/', (req,res)=>{
        res.send('Server Started Successfully!');
    })
});