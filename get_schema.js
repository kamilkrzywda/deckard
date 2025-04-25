import sqlite3 from "sqlite3";
const db = new sqlite3.Database(
  "./AllPrintings.sqlite",
  sqlite3.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the AllPrintings database.");
    }
  }
);

db.serialize(() => {
  db.each("SELECT sql FROM sqlite_master WHERE type='table';", (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(row.sql);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Closed the database connection.");
  }
});
