module.exports = function(app, shopData) {
//validation checker
const { check, validationResult } = require('express-validator');


    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }
           
    
    
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });        
    

    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });        
    

     


// // Search route
// app.get('/search', (req, res) => {
//     const { keyword } = req.query;
//     const searchQuery = `
//         SELECT * FROM stock 
//         WHERE name LIKE ? OR upc LIKE ?`;

//     db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
//         if (err) {
//             console.error('Error executing the search query:', err);
//             res.status(500).send('Internal Server Error');
//             return;
//         }
//         res.render('result.ejs', { results });
//     });
// });

// // Search result route
// app.get('/search-result', (req, res) => {
//     const { keyword } = req.query;
//     const username = req.session.userId;
//     const searchQuery = `
//         SELECT * FROM stock 
//         WHERE name LIKE ? OR upc LIKE ?`;

//     db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
//         if (err) {
//             console.error('Error executing the search query:', err);
//             res.status(500).send('Internal Server Error');
//             return;
//         }
//         res.render('result.ejs', { results });
//     });
// });

// Search route
app.get('/search-result', redirectLogin, (req, res) => {
    const { keyword } = req.query;
    const username = req.session.userId;

    const searchQuery = `
        SELECT * FROM stock 
        WHERE (name LIKE ? OR upc LIKE ?) AND username = ?`;

    db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`, username], (err, results) => {
        if (err) {
            console.error('Error executing the search query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('result.ejs', { results });
    });
});
    
    
        app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);
    });                                                                                                                                               
    app.get('/addstockitem', redirectLogin, function (req,res) {
        res.render('addstockitem.ejs', shopData);
    });

// Sales route
app.get('/sales', redirectLogin, (req, res) => {
    res.render('sales.ejs', { errorMessage: null });
});

// Sales post route
app.post('/processSale', redirectLogin, (req, res) => {
    const { keyword, quantityToSell } = req.body;
    const username = req.session.userId;

    // Query to check if the item exists and has sufficient quantity
    const checkQuery = `
        SELECT * FROM stock 
        WHERE (name LIKE ? OR upc LIKE ?) AND username = ?`;

    db.query(checkQuery, [`%${keyword}%`, `%${keyword}%`, username], (err, results) => {
        if (err) {
            console.error('Error executing the search query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (results.length === 0) {
            res.render('sales.ejs', { errorMessage: 'Item not found or you do not have permission to sell it.' });
        } else {
            const item = results[0];
            if (item.quantity < quantityToSell) {
                res.render('sales.ejs', { errorMessage: 'Insufficient quantity to sell.' });
            } else {
                // Update quantity in the database
                const newQuantity = item.quantity - quantityToSell;
                const updateQuery = `
                    UPDATE stock 
                    SET quantity = ? 
                    WHERE id = ?`;

                db.query(updateQuery, [newQuantity, item.id], (err, result) => {
                    if (err) {
                        console.error('Error updating quantity:', err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    res.send(`Successfully sold ${quantityToSell} unit(s) of ${item.name}.`);
                });
            }
        }
    });
});


    app.get('/listusers', function(req, res) {
        // Query database to get all the users
        let sqlquery = "SELECT * FROM userdetails";
                                                                                                                                                      
        // Execute sql query
        db.query(sqlquery, (err, result) => {                                                                                                         
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {Postedlist:result});
            console.log(newData)                                                                                                                      
            res.render("listusers.ejs", newData)
         });                                                                                                                                          
    });                                                                                                                                                

    app.get('/listStock', redirectLogin, function(req, res) {
        const username = req.session.userId;
    
        // Query database to get all the stock items added by the current user
        let sqlquery = "SELECT * FROM stock WHERE username = ?";
    
        // Execute sql query with username as a parameter
        db.query(sqlquery, [username], (err, result) => {
            if (err) {
                console.error("Error fetching stock items:", err);
                return res.redirect('./');
            }
    
            // Log the retrieved items for debugging
            console.log("Retrieved stock items:", result);
    
            // Construct data to pass to the template
            let newData = Object.assign({}, shopData, { stockItems: result });
    
            // Render the template with the data
            res.render("listStock.ejs", newData);
        });
    });
    

app.get('/login', function (req,res) {
res.render('login.ejs', shopData);
}); 

app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
})
app.get('/removeuser', redirectLogin, function (req,res) {
    res.render('removeuser.ejs', shopData);
});
app.post('/userremoved', redirectLogin, function (req, res) {
    const usernameToRemove = req.sanitize(req.body.username);

    // delete from database
    const deleteQuery = "DELETE FROM userdetails WHERE username = ?";
    db.query(deleteQuery, [usernameToRemove], (err, result) => {
        if (err) {
            console.log('Error removinguser:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Result:', result);

            if (result.affectedRows > 0) {
                console.log('User removed successfully');
                res.send('The user has successfully been removed. <a href='+'./'+'>Home</a>');
            } else {
                console.log('User not found');
                res.send('We were not able to locate this user. Please try again later <a href='+'./'+'>Home</a>');
            }
        }
    });
});


const http = require('https');
    app.get('/currencyX', function (req, res) {
        const options = {
            method: 'GET',
            hostname: 'exchange-rate-api1.p.rapidapi.com',
            port: null,
            path: '/convert?base=USD&target=GBP',
            headers: {
                'X-RapidAPI-Key': '9eedca4fd5msh5af26b25ea04c8cp125324jsne858df1f6b2e',
                'X-RapidAPI-Host': 'exchange-rate-api1.p.rapidapi.com'
            }
        };

        const apiReq = http.request(options, function (apiRes) {
            const chunks = [];

            apiRes.on('data', function (chunk) {
                chunks.push(chunk);
            });

            apiRes.on('end', function () {
                const body = Buffer.concat(chunks);
                const result = JSON.parse(body.toString());

                // Render the EJS template with the exchange rate information
                res.render('currencyX', { result });
            });
        });

        apiReq.end();
    });




app.post('/stockItemAdded', function (req, res) {
    // Extract data from the request body
    const { name, upc, quantity, expiry, dateAdded, datePurchased, wholesalePrice, retailPrice } = req.body;

    // Get the username of the logged-in user from the session
    const username = req.session.userId;

    // SQL query to insert data into the stock table
    const sqlQuery = "INSERT INTO stock (name, upc, quantity, expiry, dateAdded, datePurchased, wholesalePrice, retailPrice, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Values to be inserted into the stock table
    const newRecord = [name, upc, quantity, expiry, dateAdded, datePurchased, wholesalePrice, retailPrice, username];

    // Execute the SQL query
    db.query(sqlQuery, newRecord, (err, result) => {
        if (err) {
            console.error('Error inserting data into the stock table:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('Stock item added successfully!');
    });
});


app.post('/registered', [check('email').isEmail()], [check('password').isLength({ min: 8 }).withMessage('Please lengthen this text to 8 characters or more. (You are currently using  characters)')], function (req, res) {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register'); }
        else { 
    // Check if username already exists
    let existingUserQuery = "SELECT * FROM userdetails WHERE username = ?";
    db.query(existingUserQuery, [req.body.username], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            return res.send('This username is already in use. Please choose something different');
        }
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            // Store hashed password in database.
            let sqlquery = "INSERT INTO userdetails (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
            // execute sql query
            let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.sanitize(req.body.email), hashedPassword];

            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                } else {
                    result = 'Hello ' + req.sanitize(req.body.first) + ' ' + req.sanitize(req.body.last) + ' you are now registered!  We will send an email to you at ' + req.sanitize(req.body.email);
                    //result += 'Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
                    res.send(result);
                }
            });
        });
    });
}
});                                                                                                                                              
                                                                                                                                                      
app.post('/loggedin', function(req, res) {
    // Compare the form data with the data stored in the database
    let sqlquery = "SELECT hashedPassword FROM userdetails WHERE username = ?"; // query database to get the hashed password for the user
    // execute sql query
    let username = (req.sanitize(req.body.username));
    db.query(sqlquery, username, (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      else if (result.length == 0) {
        // No user found with that username
        res.send('Invalid username or password');
      }
      else {
        // User found, compare the passwords
        let hashedPassword = result[0].hashedPassword;
        const bcrypt = require('bcrypt');
        bcrypt.compare((req.sanitize(req.body.password)), hashedPassword, function(err, result) {
          if (err) {
            // Handle error
            return console.error(err.message);
          }
          else if (result == true) {
            // Save user session here, when login is successful
            req.session.userId = req.sanitize(req.body.username)
            // The passwords match, login successful
            res.send('Welcome, ' + (req.sanitize(req.body.username)) + '!' + '<a href='+'./'+'> Home</a>');


          }
          else {
            //  login failed
            res.send('Invalid username or password');
          }
        });
      }
    });
  });

//   app.get('/upcomingExpiryItems', redirectLogin, function(req, res) {
//     let today = new Date();
//     let upcomingDate = new Date();
//     upcomingDate.setDate(today.getDate() + 4); // Adjust for items expiring in 4 days or less

//     // Query database to get upcoming stock items approaching expiry date
//     let sqlQuery = "SELECT * FROM stock WHERE expiry <= ?";
//     db.query(sqlQuery, [upcomingDate], (err, result) => {
//         if (err) {
//             console.error("Error retrieving upcoming expiry items:", err);
//             res.redirect('./');
//         } else {
//             // Calculate suggested retail price adjustments
//             let suggestedPriceAdjustments = result.map(item => {
//                 let suggestedRetailPrice = (item.retailPrice - item.wholesalePrice) / 2 + item.wholesalePrice;
//                 return { id: item.id, name: item.name, suggestedRetailPrice: suggestedRetailPrice };
//             });
//             res.render("upcomingExpiryItems.ejs", { items: suggestedPriceAdjustments });
//         }
//     });
// });

// app.post('/updateRetailPrice', redirectLogin, function(req, res) {
//     console.log("Request Body:", req.body); // Log the entire request body

//     let updates = req.body.updates; // Contains updated retail prices for items
//     console.log("Updates:", updates); // Log the updates object

//     if (!updates) {
//         console.log("No updates received.");
//         res.redirect('./upcomingExpiryItems');
//         return;
//     }

//     // Update retail prices in the database
//     let updateQueries = updates.map(update => {
//         return db.query("UPDATE stock SET retailPrice = ? WHERE upc = ?", [update.retailPrice, update.upc]);
//     });

//     // Execute all update queries
//     Promise.all(updateQueries)
//         .then(() => {
//             console.log("Retail prices updated successfully.");
//             res.redirect('./upcomingExpiryItems');
//         })
//         .catch(err => {
//             console.error("Error updating retail prices:", err);
//             res.redirect('./upcomingExpiryItems');
//         });
// });
//Working app.get
// app.get('/upcomingExpiryItems', redirectLogin, function(req, res) {
//     const username = req.session.userId;
//     let today = new Date();
//     let upcomingDate = new Date();
//     upcomingDate.setDate(today.getDate() + 4); // Adjust for items expiring in 4 days or less

//     // Query database to get upcoming stock items approaching expiry date for the current user
//     let sqlQuery = "SELECT * FROM stock WHERE expiry <= ? AND username = ? AND quantity > 0";
//     db.query(sqlQuery, [upcomingDate, username], (err, result) => {
//         if (err) {
//             console.error("Error retrieving upcoming expiry items:", err);
//             res.redirect('./');
//         } else {
//             res.render("upcomingExpiryItems.ejs", { items: result });
//         }
//     });
// });

// working app.get 
// app.get('/upcomingExpiryItems', redirectLogin, function(req, res) {
//     const username = req.session.userId;
//     let today = new Date();
//     let upcomingDate = new Date();
//     upcomingDate.setDate(today.getDate() + 4); // Adjust for items expiring in 4 days or less

//     // Query database to get upcoming stock items approaching expiry date for the current user
//     let sqlQuery = "SELECT *, (retailPrice - wholesalePrice) / 2 + wholesalePrice AS suggestedRetailPrice FROM stock WHERE expiry <= ? AND username = ? AND quantity > 0";
//     db.query(sqlQuery, [upcomingDate, username], (err, result) => {
//         if (err) {
//             console.error("Error retrieving upcoming expiry items:", err);
//             res.redirect('./');
//         } else {
//             res.render("upcomingExpiryItems.ejs", { items: result });
//         }
//     });
// });

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'stocktrackteam@gmail.com', //  email address
        pass: 'ttdi mhoh bjax cdkv' //  email password 
    }
});


// working V2 but only email screen displays
// app.get('/upcomingExpiryItems', redirectLogin, function(req, res) {
//     const username = req.session.userId; // Assuming the session contains the user ID
//     let today = new Date();
//     let upcomingDate = new Date();
//     upcomingDate.setDate(today.getDate() + 4); // Adjust for items expiring in 4 days or less

//     // Query database to get upcoming stock items approaching expiry date for the current user
//     let sqlQuery = "SELECT *, (retailPrice - wholesalePrice) / 2 + wholesalePrice AS suggestedRetailPrice FROM stock WHERE expiry <= ? AND username = ? AND quantity > 0";
//     db.query(sqlQuery, [upcomingDate, username], (err, result) => {
//         if (err) {
//             console.error("Error retrieving upcoming expiry items:", err);
//             res.redirect('./');
//         } else {
//             // Retrieve the user's email address from the database
//             let emailQuery = "SELECT email FROM userdetails WHERE username = ?";
//             db.query(emailQuery, [username], (err, emailResult) => {
//                 if (err) {
//                     console.error("Error retrieving user email:", err);
//                     res.status(500).send("Internal server error");
//                 } else if (emailResult.length === 0) {
//                     res.status(404).send("User not found");
//                 } else {
//                     const userEmail = emailResult[0].email;
//                     // Compose email message with the retrieved email address
//                     const mailOptions = {
//                         from: 'stocktrackteam@gmail.com',
//                         to: userEmail, // Use the retrieved email address
//                         subject: 'Upcoming Expiry Items',
//                         html: `
//                             <p>Dear ${username},</p>
//                             <p>Your upcoming expiring items:</p>
//                             <ul>
//                                 ${result.map(item => `<li>${item.name} - Quantity: ${item.quantity} - Expiry Date: ${item.expiry}</li>`).join('')}
//                             </ul>
//                             <p>Please take necessary action.</p>
//                             <p>Regards,<br>StockTrack Team</p>
//                         `
//                     };

//                     // Send email
//                     transporter.sendMail(mailOptions, (error, info) => {
//                         if (error) {
//                             console.error('Error sending email:', error);
//                             res.status(500).send("Internal server error");
//                         } else {
//                             console.log('Email sent:', info.response);
//                             res.status(200).send("Email sent successfully");
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });

app.get('/upcomingExpiryItems', redirectLogin, function(req, res) {
    const username = req.session.userId;
    let today = new Date();
    let upcomingDate = new Date();
    upcomingDate.setDate(today.getDate() + 4); // Adjust for items expiring in 4 days or less

    // Query database to get upcoming stock items approaching expiry date for the current user
    let sqlQuery = "SELECT *, (retailPrice - wholesalePrice) / 2 + wholesalePrice AS suggestedRetailPrice FROM stock WHERE expiry <= ? AND username = ? AND quantity > 0";
    db.query(sqlQuery, [upcomingDate, username], (err, result) => {
        if (err) {
            console.error("Error retrieving upcoming expiry items:", err);
            res.redirect('./');
        } else {
            // Get the email address of the user from the database
            let userEmailQuery = "SELECT email FROM userdetails WHERE username = ?";
            db.query(userEmailQuery, [username], (emailErr, emailResult) => {
                if (emailErr) {
                    console.error("Error retrieving user email:", emailErr);
                } else {
                    const userEmail = emailResult[0].email; // Assuming there's only one email associated with the username

                    // Compose email message
                    const mailOptions = {
                        from: 'stocktrackteam@gmail.com',
                        to: userEmail, // Using the retrieved email address from the database
                        subject: 'Upcoming Expiry Items',
                        html: `
                            <p>Dear ${username},</p>
                            <p>Your upcoming expiring items:</p>
                            <ul>
                                ${result.map(item => `<li>${item.name} - Quantity: ${item.quantity} - Expiry Date: ${item.expiry}</li>`).join('')}
                            </ul>
                            <p>Please take necessary action.</p>
                            <p>Regards,<br>StockTrack Team</p>
                        `
                    };

                    // Send email
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.error("Error sending email:", error);
                        } else {
                            console.log("Email sent:", info.response);
                        }
                    });
                }
            });

            // Render the page with the fetched items
            res.render("upcomingExpiryItems.ejs", { items: result });
        }
    });
});


app.get('/wastageAndReductions', redirectLogin, function(req, res) {
    res.render('wastageAndReductions.ejs', {errorMessage:""});
});

// Working app.post
app.post('/processWastageAndReductions', redirectLogin, function(req, res) {
    const { nameUPC, quantity, retailPrice } = req.body;
    const username = req.session.userId;

    // Check if either quantity or retail price is provided
    if (!quantity && !retailPrice) {
        // If neither quantity nor retail price is provided, render the page again with an error message
        return res.render('wastageAndReductions.ejs', { errorMessage: 'Please provide either quantity or retail price.' });
    }

    // Query the database to find the item matching the provided name/UPC for the current user
    let query = "SELECT * FROM stock WHERE (name = ? OR upc = ?) AND username = ?";
    db.query(query, [nameUPC, nameUPC, username], (err, results) => {
        if (err) {
            console.error("Error querying database:", err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            // If no matching item is found, render the page again with an error message
            return res.render('wastageAndReductions.ejs', { errorMessage: 'No item found with the provided name/UPC.' });
        }

        // Update the quantity or retail price of the matching item
        const item = results[0];
        let updateQuery = "";
        let updateValues = [];

        if (quantity) {
            // If quantity is provided, update the quantity of the item
            updateQuery = "UPDATE stock SET quantity = ? WHERE id = ? AND username = ?";
            updateValues = [quantity, item.id, username];
        } else {
            // If retail price is provided, update the retail price of the item
            updateQuery = "UPDATE stock SET retailPrice = ? WHERE id = ? AND username = ?";
            updateValues = [retailPrice, item.id, username];
        }

        // Execute the update query
        db.query(updateQuery, updateValues, (err, result) => {
            if (err) {
                console.error("Error updating database:", err);
                return res.status(500).send('Internal Server Error');
            }

            // Render the page with a success message
            res.render('wastageAndReductions.ejs', { errorMessage: 'Item updated successfully.' });
        });
    });
});

app.get('/BCSTest', redirectLogin, function (req,res) {
    res.render('BCSTest.ejs', shopData);
});


    
}
