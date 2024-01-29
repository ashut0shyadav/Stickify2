const express = require('express');
const bodyParser = require('body-parser');
const {Note, User} = require('./db/models');
const authenticateUser = require('./middlewares/authenticator');
const jwt = require('jsonwebtoken');
const secret = "thisisthetodosecret";

const bcrypt = require('bcrypt');
const { promisify } = require('util');
const hashAsync = promisify(bcrypt.hash);

const mongoose = require('mongoose');

// Database connection
mongoose.connect('mongodb+srv://ashutoshyadav:cohort_password@cohortcluster.se2pxxu.mongodb.net/');

// Check connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});


const app = express();

app.use(bodyParser.json());

//endpoint for user signup
app.post('/api/signup', async (req, res) => {
    try {
        const hashedPassword = await hashAsync(req.body.password, 10);
        console.log(hashedPassword);

        const user = await User.find({ username : req.body.username });

        if(user.length != 0)
            return res.status(500).json({message  : "User already exists, try another username"});

        const newUser = new User({
            username : req.body.username,
            password : hashedPassword
        });

        const result = await newUser.save();

        res.status(201).json({message : "Congratulations! You are signed up!"});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    };
});

//endpoint for user login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id, username: user.username }, secret, { expiresIn: '12h' });
  
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.use(authenticateUser);

//get all notes
app.get('/api/notes', async (req, res) => {
    try {
        const result = await Note.find({userId : req.user.userId});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//get single note
app.get('/api/notes/noteId', async (req, res) => {
    try {
        const result = await Note.findById(req.body.id);
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//create a new note
app.post('/api/notes', async (req, res) => {
    try {
        const newNote = new Note({
            title : req.body.title,
            content : req.body.content,
            color : req.body.color,
            labels : req.body.labels,
            remainders : req.body.remainders,
            userId : req.user.userId
        });

        const savedNote = await newNote.save();
        res.status(201).json({savedNote});

    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//update a specific note
app.put('/api/notes/noteId', async (req, res) => {
    try {
        const result = await Note.updateMany({_id : req.body.id}, {$set : req.body});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//delete a note
app.delete('/api/notes/noteId', async (req, res) => {
    try {
        const result = await Note.deleteMany({_id : req.body.id});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//archive or unarchive a note
app.put('/api/notes/noteId/archive', async (req, res) => {
    try {
        const result = await Note.updateMany({_id : req.body.id}, {$set : {archived : req.body.archived}});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//add label to a note
app.post('/api/notes/noteId/labels', async (req, res) => {
    try {
        let old = await Note.findById(req.body.id);

        old.labels.push(res.body.label);

        const result = await Note.updateMany({_id : req.body.id}, {$set : old});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//remove label from a note
app.delete('/api/notes/noteId/labels/labelId', async (req, res) => {
    try {
        let old  = await Note.findById(req.body.id);
        let flag = 0;

        for(let i = 0; i < old.labels.length; i++) {
            if(old.labels[i].id == req.body.labelId) {
                old.labels = old.labels.splice(0, i) + old.labels.splice(i+1);
                flag = 1;
                break;
            }
        }

        if(!flag)
            return res.status(400).json({message : "Invalid label id"});

        const result = await Note.updateMany({_id : req.body.id}, {$set : old});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    } 
});

//add reminder to a note
app.post('/api/notes/noteId/reminders', async (req, res) => {
    try {
        let old = await Note.findById(req.body.id);

        old.remainders.push(res.body.remainder);

        const result = await Note.updateMany({_id : req.body.id}, {$set : old});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//remove reminder from a note
app.delete('/api/notes/noteId/reminders/reminderId', async (req, res) => {
    try {
        let old  = await Note.findById(req.body.id);
        let flag = 0;

        for(let i = 0; i < old.reminders.length; i++) {
            if(old.reminders[i].id == req.body.reminderId) {
                old.reminders = old.reminders.splice(0, i) + old.reminders.splice(i+1);
                flag = 1;
                break;
            }
        }

        if(!flag)
            return res.status(400).json({message : "Invalid reminder id"});

        const result = await Note.updateMany({_id : req.body.id}, {$set : old});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//get archived notes
app.get('/api/notes/archived', async (req, res) => {
    try {
        const result = await Note.find({user : req.user.userId, archived : true});
        res.status(201).json({result});
    } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});

//search for a note
app.get('/api/notes/search', async (req, res) => {
    try {
        const { query } = req.query;
    
        if (!query) {
          return res.status(400).json({ error: 'Search query is required' });
        }
    
        // Use a regular expression for a case-insensitive search
        const searchRegex = new RegExp(query, 'i');
    
        // Search for notes that match the query
        const matchingNotes = await Note.find({
          $and: [
            {
              $or: [
                { title: { $regex: searchRegex } },
                { content: { $regex: searchRegex } },
                { labels: { $in: [searchRegex] } },
              ],
            },
          ],
        });
    
        res.json(matchingNotes);
      } catch(err) {
        console.error(err);
        res.status(500).json({message : "Internal Server Error!"});
    }
});


app.listen(3000, () => {
    console.log("App is lisenting on port 3000");
}); 