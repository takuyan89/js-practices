import sqlite3 from "sqlite3";
import { promisify } from "util";
import timers from "timers/promises";

function createDb() {
  return new sqlite3.Database(":memory:");
}

function insertRecord(db, title) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO books (title) VALUES (?)", [title], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

// コールバックのエラーなし
function callbackNoError() {
  const db = createDb();

  db.run(
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
    () => {
      db.run(
        "INSERT INTO books (title) VALUES (?)",
        ["JavaScript"],
        function () {
          console.log("Inserted record with ID:", this.lastID);

          db.get("SELECT * FROM books WHERE id = ?", [this.lastID], (row) => {
            console.log("Fetched record:", row);

            db.run("DROP TABLE books", () => {
              console.log("Table dropped.");
              db.close();
            });
          });
        },
      );
    },
  );
}

// コールバックのエラーあり
function callbackWithError() {
  const db = createDb();

  db.run(
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
    (err) => {
      if (err) {
        console.error("Error during table creation:", err.message);
        return;
      }

      db.run(
        "INSERT INTO books (title) VALUES (?)",
        ["JavaScript"],
        function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
              console.error("Unique constraint error:", err.message);
            } else {
              console.error("Unexpected error during insert:", err.message);
            }
            return;
          }

          console.log("Inserted record with ID:", this.lastID);

          db.run(
            "INSERT INTO books (title) VALUES (?)",
            ["JavaScript"],
            function (err) {
              if (err) {
                if (err.code === "SQLITE_CONSTRAINT") {
                  console.error("Unique constraint error:", err.message);
                } else {
                  console.error("Unexpected error during insert:", err.message);
                }
                return;
              }

              db.get(
                "SELECT * FROM books WHERE title = ?",
                [""],
                (err, row) => {
                  if (err) {
                    console.error("Error during SELECT:", err.message);
                  } else if (!row) {
                    console.error("存在しないタイトル");
                  } else {
                    console.log("Fetched record:", row);
                  }

                  db.run("DROP TABLE books", (err) => {
                    if (err) {
                      console.error("Error during table drop:", err.message);
                      return;
                    }

                    console.log("Table dropped.");
                    db.close();
                  });
                },
              );
            },
          );
        },
      );
    },
  );
}

// Promiseのエラーなし
function promiseNoError() {
  const db = createDb();
  const get = promisify(db.get.bind(db));

  promisify(db.run.bind(db))(
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
  )
    .then(() => insertRecord(db, "JavaScript"))
    .then((lastID) => {
      console.log("Inserted record with ID:", lastID);
      return get("SELECT * FROM books WHERE id = ?", [lastID]);
    })
    .then((row) => {
      console.log("Fetched record:", row);
      return promisify(db.run.bind(db))("DROP TABLE books");
    })
    .then(() => {
      console.log("Table dropped.");
    })
    .finally(() => {
      db.close();
    });
}

// Promiseのエラーあり
function promiseWithError() {
  const db = createDb();
  const get = promisify(db.get.bind(db));

  promisify(db.run.bind(db))(
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
  )
    .then(() => insertRecord(db, "JavaScript"))
    .then((lastID) => {
      console.log("Inserted record with ID:", lastID);
      return insertRecord(db, "JavaScript");
    })
    .catch((err) => {
      if (err.code === "SQLITE_CONSTRAINT") {
        console.error("Unique constraint error:", err.message);
      } else {
        throw err;
      }
      return null;
    })
    .then(() => {
      return get("SELECT * FROM books WHERE title = ?", ["存在しないタイトル"]);
    })
    .then((row) => {
      if (!row) {
        console.error("存在しないタイトル");
      } else {
        console.log("Fetched record:", row);
      }
      return promisify(db.run.bind(db))("DROP TABLE books");
    })
    .then(() => {
      console.log("Table dropped.");
    })
    .catch((err) => {
      console.error("Unexpected error:", err.message);
    })
    .finally(() => {
      db.close();
    });
}

// Async/Awaitのエラーなし
async function asyncAwaitNoError() {
  const db = createDb();
  const get = promisify(db.get.bind(db));

  await promisify(db.run.bind(db))(
    "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
  );

  const lastID = await insertRecord(db, "JavaScript");
  console.log("Inserted record with ID:", lastID);

  const row = await get("SELECT * FROM books WHERE id = ?", [lastID]);
  console.log("Fetched record:", row);

  await promisify(db.run.bind(db))("DROP TABLE books");
  console.log("Table dropped.");

  db.close();
}

// Async/Awaitのエラーあり
async function asyncAwaitWithError() {
  const db = createDb();
  const get = promisify(db.get.bind(db));

  try {
    await promisify(db.run.bind(db))(
      "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)",
    );
    const lastID = await insertRecord(db, "JavaScript");
    console.log("Inserted record with ID:", lastID);

    try {
      await insertRecord(db, "JavaScript");
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        console.error("Unique constraint error:", err.message);
      } else {
        throw err;
      }
    }

    const row = await get("SELECT * FROM books WHERE title = ?", [
      "存在しないタイトル",
    ]);
    if (!row) {
      console.error("存在しないタイトル");
    } else {
      console.log("Fetched record:", row);
    }

    await promisify(db.run.bind(db))("DROP TABLE books");
    console.log("Table dropped.");
  } catch (err) {
    console.error("Unexpected error:", err.message);
  } finally {
    db.close();
  }
}

async function main() {
  callbackNoError();
  await timers.setTimeout(1000);
  callbackWithError();
  await timers.setTimeout(1000);

  await promiseNoError();
  await timers.setTimeout(1000);
  await promiseWithError();
  await timers.setTimeout(1000);

  await asyncAwaitNoError();
  await timers.setTimeout(1000);
  await asyncAwaitWithError();
}

main();
