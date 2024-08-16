#!/usr/bin/env node

import sqlite3 from "sqlite3";
import enquirer from "enquirer";

class Memo {
  constructor() {
    this.db = null;
  }

  open() {
    this.db = new sqlite3.Database("./memo.db", (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  initialize() {
    this.open();
    this.db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='memos'",
      (err, row) => {
        if (err) {
          console.error(err.message);
          return;
        }

        if (!row) {
          this.db.run(
            `
            CREATE TABLE IF NOT EXISTS memos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              content TEXT NOT NULL
            )
            `,
            (err) => {
              if (err) {
                console.error(err.message);
              }
            },
          );
        }
      },
    );
  }

  add(content) {
    this.db.run("INSERT INTO memos (content) VALUES (?)", content, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("メモが追加されました。");
      }
    });
  }

  list() {
    this.db.all("SELECT id, content FROM memos", (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        rows.forEach((row) => {
          console.log(`${row.content.split("\n")[0]}`);
        });
      }
    });
  }

  async read() {
    this.open();
    this.db.all("SELECT id, content FROM memos", async (err, rows) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const choices = rows.map((row) => ({
        name: `${row.content.split("\n")[0]}`,
        value: row.id,
      }));

      const response = await enquirer.select({
        name: "memo",
        message: "Choose a note you want to see:",
        choices,
      });

      const selectedId = choices.find(
        (choice) => choice.name === response,
      ).value;

      this.db.get(
        "SELECT content FROM memos WHERE id = ?",
        [selectedId],
        (err, row) => {
          if (err) {
            console.error(err.message);
          } else if (row) {
            console.log(row.content);
          } else {
            console.log("指定されたIDのメモが見つかりませんでした。");
          }

          this.close();
        },
      );
    });
  }

  async delete() {
    this.open();
    this.db.all("SELECT id, content FROM memos", async (err, rows) => {
      if (err) {
        console.error(err.message);
        return;
      }

      const choices = rows.map((row) => ({
        name: `${row.content.split("\n")[0]}`,
        value: row.id,
      }));

      const response = await enquirer.select({
        name: "memo",
        message: "Choose a memo you want to delete:",
        choices,
      });

      const selectedId = choices.find(
        (choice) => choice.name === response,
      ).value;

      this.db.run("DELETE FROM memos WHERE id = ?", [selectedId], (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log("メモが削除されました。");

          this.close();
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    }
  }
}

async function main() {
  const memo = new Memo();

  memo.initialize();

  const command = process.argv[2];

  if (!command) {
    let content = "";
    process.stdin.on("data", (chunk) => {
      content += chunk;
    });

    process.stdin.on("end", () => {
      if (content.trim()) {
        console.log("Adding memo:", content.trim());
        memo.add(content.trim());
      } else {
        console.log("メモの内容が空です。");
      }
      memo.close();
    });

    process.stdin.resume();
    process.stdin.setEncoding("utf8");
  } else {
    switch (command) {
      case "-l": {
        memo.list();
        memo.close();
        break;
      }

      case "-r": {
        await memo.read();
        break;
      }

      case "-d": {
        await memo.delete();
        break;
      }

      default: {
        memo.close();
        break;
      }
    }
  }
}

main();
