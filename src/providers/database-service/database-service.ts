import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DatabaseServiceProvider {

  loader: any;
  fetchData: Subject<boolean>;
  public database: SQLiteObject;

  constructor(private sqlite: SQLite, private alertCtrl: AlertController, private platform: Platform) {

    this.fetchData = new Subject<boolean>();

    this.platform.ready().then(() => {

      // Creating or Opening an existing database
      this.sqlite.create({
        name: 'employee.db',
        location: 'default'
      }).then((db) => {

        // Storing the database reference
        this.database = db;

        const employeeTable : string = `CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR,
          age INTEGER,
          email VARCHAR
        );`;

        // Making sure that the table exists
        db.executeSql(employeeTable, {}).then((data) => {

          this.fetchData.next(true);

        }).catch((error)=>{

          let alert = this.alertCtrl.create({
            title: 'Unable to create table',
            message: JSON.stringify(error)
          });
          alert.present();

        });

      }).catch((error) => {
        let alert = this.alertCtrl.create({
          title: 'Unable to open the database',
          message: JSON.stringify(error)
        });
        alert.present();
      });

    });

  }

  insertEmployee(form) {

    const insertSql = 'INSERT INTO employees(id, name, age, email) VALUES (?,?,?,?)';
    const values = [null, form.name || null, form.age || null, form.email || null];

    return this.database.executeSql(insertSql, values);

  }

  deleteEmployee(id: number) {

    const deleteSql = `DELETE FROM employees WHERE id=${id}`;
    
    return this.database.executeSql(deleteSql, {});

  }

  updateEmployee(id, form) {

    const updateSql = `UPDATE employees SET name='${form.name}', age=${form.age}, email='${form.email}' WHERE id=${id}`;

    return this.database.executeSql(updateSql, {});

  }

  fetchEmployees() {

    const fetchSql = 'SELECT * FROM employees';
    return this.database.executeSql(fetchSql, {});
    
  }

}
