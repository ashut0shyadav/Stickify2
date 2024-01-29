const z = require('zod');

const signupInput = z.object({
    username : z.string().min(3),
    password : z.string().min(8)
});

const loginInput = z.object({
    username : z.string().min(3),
    password : z.string().min(8)
});

const noteInput = z.object({
    id : z.string().optional(),
    title : z.string(),
    content : z.string(),
    color : z.string().optional(),
    labels : z.array(z.string()).optional(),
    archived : z.boolean().optional(),
    reminders : z.array(z.string()).optional(),
});



