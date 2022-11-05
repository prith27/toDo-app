const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const _ = require("lodash");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://p27:sam@cluster0.vjlpv5b.mongodb.net/todolistDB");
const itemsSchema = {
  name: String,
};
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Go Gym",
});
const item3 = new Item({
  name: "Recover Protein",
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  let day = date();
  Item.find({}, (err, results) => {
    if (results.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("Successfully added default items!");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItem: results });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, fl) => {
      fl.items.push(item);
      fl.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) console.log(err);
      else console.log("Removed!");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, result) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", (req, res) => {
  const clname = _.capitalize(req.params.customListName);
  List.findOne({ name: clname }, (err, result) => {
    if (!err) {
      if (!result) {
        const list = new List({
          name: clname,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + clname);
      } else {
        res.render("list", { listTitle: clname, newListItem: result.items });
      }
    } else {
      console.log(err);
    }
  });
});

// app.post("/work", (req, res) => {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.listen(3000, () => {
  console.log("server running on port 3000");
});
