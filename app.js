const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const app = express();
const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://abhishekbansal8948:Abhi1234@cluster0.iq08hdk.mongodb.net/todolistDB',{ useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }).then(() => console.log("connected")).catch((error) => console.log(error));

const items = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", items);

const lists = new mongoose.Schema({
  name: String,
  items: [items]
});
const List = mongoose.model("List", lists);
const it1 = new Item({
  name: "Welcome to Todo List"
})
const it2 = new Item({
  name: "Hit the + button for add in list"
})
const it3 = new Item({
  name: "<-- Hit this button for delete"
})
const defaultItems = [it1, it2, it3];


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000);
app.get("/about", function(req,res){
    res.render("about");
});
app.get("/", function (req, res) {
  Item.find().then(function (f) {
    if(f.length == 0){
      Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", { days: "Todo List", item: f });
    }
  })
  .catch(function (err) {
    console.log(err)
  });
  
});
app.get("/:naem", function (req, res) {
  const n = _.capitalize(req.params.naem);
  List.findOne({name: ""+n+""}).then(function (f) {
    if(f == null){
      let l1 = new List({
        name: ""+n+"",
        items: defaultItems
      });
      l1.save();
      res.redirect("/"+ n);  
    }
    else{
      res.render("list", { days: ""+n+"", item: f.items });
    }
  })
  .catch(function (err) {
    console.log(err);
  });
});
app.post("/", function (req, res) {
  let itemName = req.body.todoitem;
  let listName = req.body.subname;
  const it4 = new Item({
    name: itemName
  })
  if(listName == "Todo List"){
    it4.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: ""+listName+""}).then(function (f) {
      f.items.push(it4);
      f.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete", function(req,res){
  const idItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName == "Todo List"){
    Item.deleteOne({_id: ""+idItem+""}).then(function () {
              console.log("successfully updated");
          }).catch(function (err) {
            console.log(err);
          }); 
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: idItem}}}).then(function () {
      res.redirect("/"+listName);
    }).catch(function (err) {
      console.log(err);
    });
  }
});

