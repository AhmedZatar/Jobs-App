'use strict';

const express= require('express');
const cors= require('cors');
const superagent= require('superagent');
const pg= require('pg');
const methodOverride= require('method-override');
require('dotenv').config();

const server =express();
const PORT = process.env.PORT || 5000;
const client = new pg.Client(process.env.DATABASE_URL);

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');


server.get('/',homeHandler);
server.get('/search',searchHandler);
server.post('/new',newHandler);
server.post('/addjob',addHandler);
server.get('/mylist',mylistHandler);
server.get('/details/:id',detailsHandler);
server.put('/update/:id',updateHandler);
server.delete('/delete/:id',deleteHandler);



function homeHandler(req,res){

  let url='https://jobs.github.com/positions.json?location=usa';
  superagent.get(url)
    .then((data)=>{
      let initailData=data.body;
      let jobsData=initailData.map((obj)=>{

        return new Job(obj);

      });
      res.render('index',{jobs:jobsData});
    });


}

function searchHandler(req,res){
  res.render('search');
}

function newHandler(req,res){
  let search = req.body.search;

  let url2= `https://jobs.github.com/positions.json?description=${search}&location=usa`;
  superagent.get(url2)
    .then((data2)=>{

      console.log(data2.body);
      let initailData=data2.body;
      let jobsData=initailData.map((obj)=>{
        return new Job(obj);
      });
      res.render('new',{jobs:jobsData});

    });
}

function addHandler(req,res){

  let sql = 'INSERT INTO jobs (title, company, location, url, description) VALUES ($1,$2,$3,$4,$5) RETURNING *;';
  let safeValues =[req.body.title, req.body.company, req.body.location, req.body.url, req.body.description];
  client.query(sql,safeValues)
    .then((data)=>{

      res.redirect('/mylist');

    });

}

function mylistHandler(req,res){
  let sql ='SELECT * FROM jobs';
  client.query(sql)
    .then((data)=>{
      res.render('mylist',{jobs:data.rows});
    });
}

function detailsHandler(req,res){
  let id = req.params.id;
  let sql ='SELECT * FROM jobs WHERE id=$1;';
  let safeValues= [id];
  client.query(sql,safeValues)
    .then((data)=>{
      res.render('detail',{jobs:data.rows[0]});
    });

}

function updateHandler(req,res){
  let id = req.params.id;
  let sql ='UPDATE jobs SET title=$1, company=$2, location=$3, url=$4, description=$5 WHERE id=$6;';
  let safeValues =[req.body.title, req.body.company, req.body.location, req.body.url, req.body.description,id];
  client.query(sql,safeValues)
    .then(()=>{

      res.redirect(`/details/${id}`);

    });


}

function deleteHandler(req,res){
  let id = req.params.id;
  let sql='DELETE FROM jobs WHERE id=$1;';
  let safeValues=[id];
  client.query(sql,safeValues)
    .then(()=>{
      res.redirect(`/mylist`);
    });

}

function Job(obj){
  this.title=obj.title;
  this.company=obj.company;
  this.location=obj.location;
  this.url=obj.url;
  this.description=obj.description;
}

client.connect()
  .then(()=>{
    server.listen(PORT,()=>{
      console.log(`My port is ${PORT}`);
    });
  });
