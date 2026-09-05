const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const db = require("./database");
// =========================
// NOTIFICATIONS TABLE
// =========================

db.run(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ===============================
// BLOCKCHAIN
// ===============================

const {
  registerCredential,
  verifyCredential,
} = require("./blockchain");


// ===============================
// APP CONFIGURATION
// ===============================

const app = express();
const PORT = 5000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// UPLOADS FOLDER
// ===============================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },

});

const upload = multer({
  storage: storage,
});


// ===============================
// HOME / TEST ROUTE
// ===============================

app.get("/", (req, res) => {

  res.json({
    message: "Veri Chain Backend is running!",
    status: "OK",
  });

});


// ===============================
// REGISTER USER
// ===============================

app.post("/api/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    if (!name || !email || !password) {

      return res.status(400).json({
        message: "All fields are required.",
      });

    }


    const passwordHash =
      await bcrypt.hash(password, 10);


    const sql = `
  INSERT INTO users
  (name, email, password_hash, role)
  VALUES (?, ?, ?, ?)
`;


    db.run(
      sql,
     [name, email, passwordHash, "USER"],
      function (err) {

        if (err) {

          if (err.message.includes("UNIQUE")) {

            return res.status(409).json({
              message: "Email already registered.",
            });

          }


          console.error(err);

          return res.status(500).json({
            message: "Failed to create account.",
          });

        }


        res.status(201).json({

          message: "Registration successful!",

          userId: this.lastID,

        });

      }
    );


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });

  }

});


// ===============================
// LOGIN USER
// ===============================

app.post("/api/login", (req, res) => {

  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email.trim().toLowerCase()],
    async (err, user) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error.",
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Wrong email or password.",
        });
      }

      try {

        const validPassword = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!validPassword) {
          return res.status(401).json({
            message: "Wrong email or password.",
          });
        }

        res.json({
          message: "Login successful!",

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "USER",
          },
        });

      } catch (error) {

        console.error(error);

        res.status(500).json({
          message: "Login failed.",
        });
      }

    }
  );

});


// ===============================
// UPLOAD DOCUMENT
// + BLOCKCHAIN REGISTRATION
// ===============================

app.post(
  "/api/documents/upload",
  upload.single("document"),
  async (req, res) => {

    try {

      // ===============================
      // CHECK FILE
      // ===============================

      if (!req.file) {

        return res.status(400).json({
          message: "Please select a document.",
        });

      }


      // ===============================
      // CHECK USER
      // ===============================

      const userId = req.body.user_id;


      if (!userId) {

        return res.status(400).json({
          message: "User ID is required.",
        });

      }


      // ===============================
      // READ FILE
      // ===============================

      const fileBuffer =
        fs.readFileSync(req.file.path);


      // ===============================
      // SHA-256 HASH
      // ===============================

      const sha256Hash =
        crypto
          .createHash("sha256")
          .update(fileBuffer)
          .digest("hex");


      console.log("");
      console.log("=================================");
      console.log("DOCUMENT UPLOAD");
      console.log("=================================");
      console.log(
        "Filename:",
        req.file.originalname
      );
      console.log(
        "SHA-256:",
        sha256Hash
      );


      // ===============================
      // CREATE DOCUMENT ID
      // ===============================

      const documentId =
        "VC-" +
        Date.now()
          .toString(36)
          .toUpperCase() +
        "-" +
        crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase();


      console.log(
        "Document ID:",
        documentId
      );


      // ===============================
      // BLOCKCHAIN REGISTRATION
      // ===============================

      console.log(
        "Registering document on blockchain..."
      );


      const blockchainResult =
        await registerCredential(
          documentId,
          sha256Hash
        );


      console.log(
        "Blockchain registration successful!"
      );


      console.log(
        "Transaction Hash:",
        blockchainResult.txHash
      );


      // ===============================
      // SAVE TO SQLITE
      // ===============================

      const sql = `
        INSERT INTO documents
        (
          user_id,
          document_id,
          filename,
          file_type,
          sha256_hash,
          tx_hash,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;


      db.run(
        sql,
        [
          userId,
          documentId,
          req.file.originalname,
          req.file.mimetype,
          sha256Hash,
          blockchainResult.txHash,
          "REGISTERED",
        ],
        function (err) {

          if (err) {

            console.error(
              "Database save error:",
              err
            );


            return res.status(500).json({

              message:
                "Blockchain registration successful, but database save failed.",

              tx_hash:
                blockchainResult.txHash,

            });

          }

// ===============================
// CREATE UPLOAD NOTIFICATION
// ===============================

db.run(
  `
  INSERT INTO notifications
  (user_id, title, message, type)
  VALUES (?, ?, ?, ?)
  `,
  [
    userId,
    "Document Uploaded",
    `${req.file.originalname} has been successfully uploaded and registered on blockchain.`,
    "success"
  ],
  (notificationErr) => {
    if (notificationErr) {
      console.error(
        "Notification creation error:",
        notificationErr
      );
    }
  }
);
          // ===============================
          // SUCCESS
          // ===============================

          console.log(
            "Document saved to SQLite."
          );

          console.log("=================================");
          console.log("");


          res.status(201).json({

            message:
              "Document uploaded and registered on blockchain successfully!",


            document: {

              id: this.lastID,

              user_id: userId,

              document_id:
                documentId,

              filename:
                req.file.originalname,

              file_type:
                req.file.mimetype,

              sha256_hash:
                sha256Hash,

              tx_hash:
                blockchainResult.txHash,

              contract_address:
                blockchainResult.contractAddress,

              status:
                "REGISTERED",

            },

          });

        }
      );


    } catch (error) {

      console.error("");
      console.error(
        "================================="
      );
      console.error(
        "BLOCKCHAIN REGISTRATION FAILED"
      );
      console.error(
        "================================="
      );
      console.error(error);
      console.error("");


      res.status(500).json({

        message:
          "Document upload failed during blockchain registration.",

        error:
          error.message,

      });

    }

  }
);


// ===============================
// GET USER DOCUMENTS
// ===============================

app.get(
  "/api/documents/:userId",
  (req, res) => {

    const userId =
      req.params.userId;


    db.all(
      `
      SELECT *
      FROM documents
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
      (err, rows) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            message:
              "Failed to fetch documents.",
          });

        }


        res.json({
          documents: rows,
        });

      }
    );

  }
);


// ===============================
// VERIFY DOCUMENT
// USING BLOCKCHAIN
// ===============================

app.post(
  "/api/verify",
  async (req, res) => {

    try {

      const {
        documentId,
        sha256Hash
      } = req.body;


      // ===============================
      // VALIDATION
      // ===============================

      if (!documentId || !sha256Hash) {

        return res.status(400).json({
          message:
            "Document ID and SHA-256 hash are required."
        });

      }


      // ===============================
      // FIND DOCUMENT
      // ===============================

      db.get(
        `
        SELECT *
        FROM documents
        WHERE document_id = ?
        `,
        [documentId],
        async (err, document) => {

          if (err) {

            console.error(err);

            return res.status(500).json({
              message: "Database error."
            });

          }


          // ===============================
          // DOCUMENT NOT FOUND
          // ===============================

          if (!document) {

            db.run(
              `
              INSERT INTO verification_logs
              (document_id, result)
              VALUES (?, ?)
              `,
              [
                documentId,
                "INVALID"
              ]
            );

            return res.json({

              verified: false,

              status: "INVALID",

              message:
                "Document not found."

            });

          }


          // ===============================
          // BLOCKCHAIN VERIFICATION
          // ===============================

          console.log("");
          console.log(
            "Verifying document on blockchain..."
          );

          console.log(
            "Document ID:",
            documentId
          );


          const blockchainVerified =
            await verifyCredential(
              documentId,
              sha256Hash
            );


          console.log(
            "Blockchain verification:",
            blockchainVerified
          );


          // ===============================
          // UPDATE DOCUMENT STATUS
          // ===============================

          if (blockchainVerified) {

            db.run(
              `
              UPDATE documents
              SET status = ?
              WHERE document_id = ?
              `,
              [
                "VERIFIED",
                documentId
              ],
              (updateErr) => {

                if (updateErr) {
                  console.error(
                    "Status update error:",
                    updateErr
                  );
                }

              }
            );

          }
          // ===============================
// CREATE VERIFICATION NOTIFICATION
// ===============================

db.run(
  `
  INSERT INTO notifications
  (user_id, title, message, type)
  VALUES (?, ?, ?, ?)
  `,
  [
    document.user_id,
    "Document Verified",
    `${document.filename} has been successfully verified on the blockchain.`,
    "success"
  ],
  (notificationErr) => {
    if (notificationErr) {
      console.error(
        "Verification notification error:",
        notificationErr
      );
    }
  }
);


          // ===============================
          // SAVE VERIFICATION LOG
          // ===============================

          db.run(
            `
            INSERT INTO verification_logs
            (document_id, result)
            VALUES (?, ?)
            `,
            [
              documentId,
              blockchainVerified
                ? "VERIFIED"
                : "INVALID"
            ]
          );


          // ===============================
          // RESPONSE
          // ===============================

          res.json({

            verified:
              blockchainVerified,

            status:
              blockchainVerified
                ? "VERIFIED"
                : "INVALID",

            message:
              blockchainVerified
                ? "Document is authentic and verified on blockchain!"
                : "Document hash does not match blockchain record.",

            document: {

              document_id:
                document.document_id,

              filename:
                document.filename,

              status:
                blockchainVerified
                  ? "VERIFIED"
                  : document.status,

              sha256_hash:
                document.sha256_hash,

              tx_hash:
                document.tx_hash,

              created_at:
                document.created_at

            }

          });

        }

      );

    } catch (error) {

      console.error(
        "Blockchain verification error:",
        error
      );


      res.status(500).json({

        verified: false,

        status: "ERROR",

        message:
          "Blockchain verification failed.",

        error:
          error.message

      });

    }

  }
);
// ===============================
// ADMIN APIs
// ===============================

// ===============================
// ADMIN STATS
// ===============================

app.get("/api/admin/stats", (req, res) => {

  const stats = {};

  db.get(
    "SELECT COUNT(*) AS totalUsers FROM users",
    (err, users) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to fetch user statistics."
        });
      }

      stats.totalUsers = users.totalUsers;

      db.get(
        "SELECT COUNT(*) AS totalDocuments FROM documents",
        (err, documents) => {

          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Failed to fetch document statistics."
            });
          }

          stats.totalDocuments =
            documents.totalDocuments;

          db.get(
            `
            SELECT COUNT(*) AS verifiedDocuments
            FROM documents
            WHERE status = 'VERIFIED'
            `,
            (err, verified) => {

              if (err) {
                console.error(err);
                return res.status(500).json({
                  message:
                    "Failed to fetch verification statistics."
                });
              }

              stats.verifiedDocuments =
                verified.verifiedDocuments;

              db.get(
                `
                SELECT COUNT(*) AS registeredDocuments
                FROM documents
                WHERE status = 'REGISTERED'
                `,
                (err, registered) => {

                  if (err) {
                    console.error(err);
                    return res.status(500).json({
                      message:
                        "Failed to fetch document statistics."
                    });
                  }

                  stats.registeredDocuments =
                    registered.registeredDocuments;

                  res.json({
                    stats
                  });

                }
              );

            }
          );

        }
      );

    }
  );

});


// ===============================
// GET ALL USERS
// ===============================

app.get("/api/admin/users", (req, res) => {

  db.all(
    `
    SELECT
      id,
      name,
      email,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC
    `,
    (err, rows) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Failed to fetch users."
        });
      }

      res.json({
        users: rows || []
      });

    }
  );

});


// ===============================
// UPDATE USER ROLE
// ===============================

app.put("/api/admin/users/:id/role", (req, res) => {

  const userId = req.params.id;
  const { role } = req.body;

  const allowedRoles = [
    "USER",
    "VERIFIER",
    "ADMIN"
  ];

  const newRole =
    String(role || "")
      .toUpperCase();

  if (!allowedRoles.includes(newRole)) {

    return res.status(400).json({
      message:
        "Invalid role. Allowed roles: USER, VERIFIER, ADMIN."
    });

  }

  db.run(
    `
    UPDATE users
    SET role = ?
    WHERE id = ?
    `,
    [newRole, userId],
    function (err) {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Failed to update user role."
        });
      }

      if (this.changes === 0) {

        return res.status(404).json({
          message: "User not found."
        });

      }

      res.json({
        message:
          "User role updated successfully.",
        role: newRole
      });

    }
  );

});


// ===============================
// DELETE USER
// ===============================

app.delete("/api/admin/users/:id", (req, res) => {

  const userId = req.params.id;

  db.run(
    `
    DELETE FROM users
    WHERE id = ?
    `,
    [userId],
    function (err) {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Failed to delete user."
        });
      }

      if (this.changes === 0) {

        return res.status(404).json({
          message: "User not found."
        });

      }

      res.json({
        message:
          "User deleted successfully."
      });

    }
  );

});


// ===============================
// GET ALL DOCUMENTS - ADMIN
// ===============================

app.get("/api/admin/documents", (req, res) => {

  db.all(
    `
    SELECT
      documents.id,
      documents.document_id,
      documents.filename,
      documents.file_type,
      documents.sha256_hash,
      documents.tx_hash,
      documents.status,
      documents.created_at,
      users.name AS owner_name,
      users.email AS owner_email
    FROM documents
    LEFT JOIN users
      ON documents.user_id = users.id
    ORDER BY documents.created_at DESC
    `,
    (err, rows) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message:
            "Failed to fetch admin documents."
        });
      }

      res.json({
        documents: rows || []
      });

    }
  );

});
// ===============================
// SERVER START
// ===============================
// =========================
// NOTIFICATIONS API
// =========================

// Get notifications for a user
app.get("/api/notifications/:userId", (req, res) => {
  const { userId } = req.params;

  db.all(
    `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Notifications fetch error:", err);
        return res.status(500).json({
          message: "Failed to fetch notifications."
        });
      }

      res.json({
        notifications: rows || []
      });
    }
  );
});


// Mark one notification as read
app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;

  db.run(
    `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
    `,
    [id],
    function (err) {
      if (err) {
        console.error("Notification read error:", err);
        return res.status(500).json({
          message: "Failed to update notification."
        });
      }

      res.json({
        message: "Notification marked as read."
      });
    }
  );
});


// Mark all notifications as read
app.put("/api/notifications/user/:userId/read-all", (req, res) => {
  const { userId } = req.params;

  db.run(
    `
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ?
    `,
    [userId],
    function (err) {
      if (err) {
        console.error("Read all notifications error:", err);
        return res.status(500).json({
          message: "Failed to update notifications."
        });
      }

      res.json({
        message: "All notifications marked as read."
      });
    }
  );
});
app.listen(PORT, () => {

  console.log("");

  console.log(
    "================================="
  );

  console.log(
    "   VERI CHAIN BACKEND RUNNING"
  );

  console.log(
    "================================="
  );

  console.log(
    `Server: http://localhost:${PORT}`
  );

  console.log(
    "Database: SQLite Connected"
  );

  console.log(
    "Blockchain: Connected"
  );

  console.log(
    "Status: Ready"
  );

  console.log(
    "================================="
  );

});